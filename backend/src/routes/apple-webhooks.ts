/**
 * Apple In-App Purchase Server Notifications V2
 * Documentation: https://developer.apple.com/documentation/appstoreservernotifications
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// JWKS client pour valider les JWT Apple
const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  cacheMaxAge: 86400000, // 24 heures
});

// Fonction pour obtenir la clé publique Apple
function getApplePublicKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    }
  });
}

// Mapping des product IDs Apple vers le nombre de mois
const PRODUCT_ID_TO_MONTHS: { [key: string]: number } = {
  'com.dakanews.premium.monthly': 1,
  'com.dakanews.premium.yearly': 12,
};

interface AppleNotification {
  notificationType: string;
  subtype?: string;
  data: {
    signedTransactionInfo: string;
    signedRenewalInfo?: string;
  };
}

interface TransactionInfo {
  transactionId: string;
  originalTransactionId: string;
  webOrderLineItemId?: string;
  bundleId: string;
  productId: string;
  subscriptionGroupIdentifier: string;
  purchaseDate: number;
  originalPurchaseDate: number;
  expiresDate: number;
  quantity: number;
  type: string;
  inAppOwnershipType: string;
  signedDate: number;
  environment: string;
}

/**
 * POST /api/webhooks/apple
 * Reçoit les notifications serveur Apple (Server-to-Server Notifications V2)
 */
router.post('/apple', express.json(), async (req, res) => {
  try {
    console.log('📱 Webhook Apple reçu');

    const { signedPayload } = req.body;

    if (!signedPayload) {
      console.error('❌ signedPayload manquant');
      return res.status(400).json({ error: 'signedPayload requis' });
    }

    // 1. Vérifier et décoder le JWT Apple
    let payload: AppleNotification;
    try {
      payload = await new Promise((resolve, reject) => {
        jwt.verify(
          signedPayload,
          getApplePublicKey,
          {
            algorithms: ['ES256'],
            issuer: 'https://appleid.apple.com',
          },
          (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded as AppleNotification);
          }
        );
      });
    } catch (err) {
      console.error('❌ Erreur validation JWT Apple:', err);
      return res.status(401).json({ error: 'JWT invalide' });
    }

    console.log('✅ JWT Apple validé:', payload.notificationType);

    // 2. Décoder les informations de transaction
    let transactionInfo: TransactionInfo;
    try {
      transactionInfo = jwt.decode(payload.data.signedTransactionInfo) as TransactionInfo;
    } catch (err) {
      console.error('❌ Erreur décodage transaction:', err);
      return res.status(400).json({ error: 'Transaction invalide' });
    }

    const {
      originalTransactionId,
      transactionId,
      productId,
      expiresDate,
      environment,
    } = transactionInfo;

    console.log(`📱 Transaction Apple: ${originalTransactionId} (${productId})`);

    // 3. Récupérer le user_id depuis la subscription existante
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('apple_original_transaction_id', originalTransactionId)
      .single();

    let userId = existingSub?.user_id;

    // 4. Gérer les différents types de notifications
    switch (payload.notificationType) {
      case 'INITIAL_BUY':
      case 'DID_RENEW':
        console.log(`✅ Abonnement Apple actif: ${payload.notificationType}`);

        // Si c'est un INITIAL_BUY et qu'on n'a pas de user_id, on ne peut pas continuer
        if (!userId && payload.notificationType === 'INITIAL_BUY') {
          console.error('❌ INITIAL_BUY sans user_id existant - l\'app doit d\'abord créer la subscription');
          return res.status(400).json({ 
            error: 'L\'application doit d\'abord enregistrer l\'abonnement avec le user_id' 
          });
        }

        if (userId) {
          // Calculer la date d'expiration
          const expirationDate = new Date(expiresDate);
          const months = PRODUCT_ID_TO_MONTHS[productId] || 1;

          // Activer Premium
          await supabase.rpc('activate_premium', {
            user_id_param: userId,
            months: months,
          });

          // Upsert subscription
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            platform: 'apple',
            apple_transaction_id: transactionId,
            apple_original_transaction_id: originalTransactionId,
            apple_product_id: productId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: expirationDate.toISOString(),
          });

          console.log(`✅ Premium activé pour user: ${userId}`);
        }
        break;

      case 'DID_FAIL_TO_RENEW':
        console.log('⚠️ Échec de renouvellement Apple');
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('apple_original_transaction_id', originalTransactionId);
        }
        break;

      case 'DID_CHANGE_RENEWAL_STATUS':
        if (payload.subtype === 'AUTO_RENEW_DISABLED') {
          console.log('⚠️ Renouvellement automatique désactivé');
          if (userId) {
            await supabase
              .from('subscriptions')
              .update({ status: 'canceled' })
              .eq('apple_original_transaction_id', originalTransactionId);
          }
        }
        break;

      case 'EXPIRED':
        console.log('❌ Abonnement Apple expiré');
        if (userId) {
          await supabase.rpc('deactivate_premium', {
            user_id_param: userId,
          });

          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('apple_original_transaction_id', originalTransactionId);

          console.log(`✅ Premium désactivé pour user: ${userId}`);
        }
        break;

      case 'REFUND':
        console.log('💰 Remboursement Apple');
        if (userId) {
          await supabase.rpc('deactivate_premium', {
            user_id_param: userId,
          });

          await supabase
            .from('subscriptions')
            .update({ status: 'refunded' })
            .eq('apple_original_transaction_id', originalTransactionId);

          console.log(`✅ Premium désactivé (remboursement) pour user: ${userId}`);
        }
        break;

      default:
        console.log(`ℹ️ Notification Apple non gérée: ${payload.notificationType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook Apple:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
