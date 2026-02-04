/**
 * Google Play In-App Purchase Real-Time Developer Notifications
 * Documentation: https://developer.android.com/google/play/billing/rtdn-reference
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Client OAuth2 pour valider les messages Google Pub/Sub
const authClient = new OAuth2Client();

// Mapping des product IDs Google vers le nombre de mois
const PRODUCT_ID_TO_MONTHS: { [key: string]: number } = {
  'premium_monthly': 1,
  'premium_yearly': 12,
};

interface GooglePubSubMessage {
  message: {
    data: string; // Base64 encoded JSON
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface GoogleNotificationData {
  version: string;
  packageName: string;
  eventTimeMillis: string;
  subscriptionNotification?: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    subscriptionId: string;
  };
  testNotification?: {
    version: string;
  };
}

// Types de notifications Google Play
const NOTIFICATION_TYPE = {
  SUBSCRIPTION_RECOVERED: 1,
  SUBSCRIPTION_RENEWED: 2,
  SUBSCRIPTION_CANCELED: 3,
  SUBSCRIPTION_PURCHASED: 4,
  SUBSCRIPTION_ON_HOLD: 5,
  SUBSCRIPTION_IN_GRACE_PERIOD: 6,
  SUBSCRIPTION_RESTARTED: 7,
  SUBSCRIPTION_PRICE_CHANGE_CONFIRMED: 8,
  SUBSCRIPTION_DEFERRED: 9,
  SUBSCRIPTION_PAUSED: 10,
  SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED: 11,
  SUBSCRIPTION_REVOKED: 12,
  SUBSCRIPTION_EXPIRED: 13,
};

/**
 * POST /api/webhooks/google
 * Reçoit les notifications Pub/Sub de Google Play
 */
router.post('/google', express.json(), async (req, res) => {
  try {
    console.log('🤖 Webhook Google reçu');

    const pubsubMessage: GooglePubSubMessage = req.body;

    // Vérifier que le message vient bien de Google Pub/Sub
    if (!pubsubMessage?.message?.data) {
      console.error('❌ Format de message Pub/Sub invalide');
      return res.status(400).json({ error: 'Format invalide' });
    }

    // Décoder le message Base64
    const decodedData = Buffer.from(pubsubMessage.message.data, 'base64').toString('utf-8');
    const notification: GoogleNotificationData = JSON.parse(decodedData);

    console.log('📦 Notification Google décodée:', notification);

    // Ignorer les notifications de test
    if (notification.testNotification) {
      console.log('ℹ️ Notification de test Google ignorée');
      return res.json({ received: true });
    }

    // Traiter uniquement les notifications d'abonnement
    if (!notification.subscriptionNotification) {
      console.log('ℹ️ Notification Google non-abonnement ignorée');
      return res.json({ received: true });
    }

    const {
      notificationType,
      purchaseToken,
      subscriptionId,
    } = notification.subscriptionNotification;

    console.log(`🤖 Google notif type: ${notificationType} (${subscriptionId})`);

    // Récupérer le user_id depuis la subscription existante
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('google_purchase_token', purchaseToken)
      .single();

    const userId = existingSub?.user_id;

    // Gérer les différents types de notifications
    switch (notificationType) {
      case NOTIFICATION_TYPE.SUBSCRIPTION_PURCHASED:
      case NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED:
      case NOTIFICATION_TYPE.SUBSCRIPTION_RECOVERED:
      case NOTIFICATION_TYPE.SUBSCRIPTION_RESTARTED:
        console.log(`✅ Abonnement Google actif: ${notificationType}`);

        if (!userId) {
          console.error('❌ Notification sans user_id existant - l\'app doit d\'abord créer la subscription');
          return res.status(400).json({ 
            error: 'L\'application doit d\'abord enregistrer l\'abonnement avec le user_id' 
          });
        }

        // Calculer la durée basée sur le product ID
        const months = PRODUCT_ID_TO_MONTHS[subscriptionId] || 1;

        // Activer Premium
        await supabase.rpc('activate_premium', {
          user_id_param: userId,
          months: months,
        });

        // Upsert subscription
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + months);

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          platform: 'google',
          google_purchase_token: purchaseToken,
          google_product_id: subscriptionId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: expirationDate.toISOString(),
        });

        console.log(`✅ Premium activé pour user: ${userId}`);
        break;

      case NOTIFICATION_TYPE.SUBSCRIPTION_ON_HOLD:
      case NOTIFICATION_TYPE.SUBSCRIPTION_IN_GRACE_PERIOD:
        console.log('⚠️ Abonnement Google en pause/grâce');
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('google_purchase_token', purchaseToken);
        }
        break;

      case NOTIFICATION_TYPE.SUBSCRIPTION_CANCELED:
      case NOTIFICATION_TYPE.SUBSCRIPTION_PAUSED:
        console.log('⚠️ Abonnement Google annulé/pausé');
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('google_purchase_token', purchaseToken);
        }
        break;

      case NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED:
        console.log('❌ Abonnement Google expiré');
        if (userId) {
          await supabase.rpc('deactivate_premium', {
            user_id_param: userId,
          });

          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('google_purchase_token', purchaseToken);

          console.log(`✅ Premium désactivé pour user: ${userId}`);
        }
        break;

      case NOTIFICATION_TYPE.SUBSCRIPTION_REVOKED:
        console.log('💰 Abonnement Google révoqué (remboursement)');
        if (userId) {
          await supabase.rpc('deactivate_premium', {
            user_id_param: userId,
          });

          await supabase
            .from('subscriptions')
            .update({ status: 'refunded' })
            .eq('google_purchase_token', purchaseToken);

          console.log(`✅ Premium désactivé (remboursement) pour user: ${userId}`);
        }
        break;

      default:
        console.log(`ℹ️ Notification Google non gérée: ${notificationType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook Google:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
