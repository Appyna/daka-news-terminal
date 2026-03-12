import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
});

// Initialiser Supabase avec service_role key pour bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/webhooks/stripe
 * Webhook Stripe pour gérer les événements d'abonnement
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ Signature webhook manquante');
    return res.status(400).send('Webhook signature manquante');
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('❌ Erreur vérification signature webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔔 Webhook reçu:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error('❌ userId manquant dans metadata');
          break;
        }

        console.log('✅ Paiement réussi pour user:', userId);

        // Récupérer la subscription Stripe pour avoir les vraies dates
        const stripeSubscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Les dates sont dans items.data[0] pour les nouvelles subscriptions
        const subscriptionItem = stripeSubscription.items?.data?.[0];
        const periodEndTimestamp = subscriptionItem?.current_period_end || stripeSubscription.current_period_end;
        const periodStartTimestamp = subscriptionItem?.current_period_start || stripeSubscription.current_period_start;
        
        if (!periodEndTimestamp || !periodStartTimestamp) {
          console.error('❌ Dates manquantes dans subscription:', JSON.stringify(stripeSubscription, null, 2));
          break;
        }
        
        const periodEnd = new Date(periodEndTimestamp * 1000);
        const periodStart = new Date(periodStartTimestamp * 1000);

        // Mettre à jour le profil avec la vraie date de fin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_until: periodEnd.toISOString(),
          })
          .eq('id', userId);

        if (profileError) {
          console.error('❌ Erreur mise à jour profil:', profileError);
        } else {
          console.log('✅ Premium activé pour user:', userId, 'jusqu\'au', periodEnd.toISOString());

          // Créer/mettre à jour la subscription avec les vraies dates
          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              platform: 'stripe',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: 'active',
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
            });

          if (subError) {
            console.error('❌ Erreur insertion subscription:', subError);
          } else {
            console.log('✅ Subscription créée dans la base:', subscriptionId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription: any = event.data.object;
        const customerId = subscription.customer as string;

        // Récupérer le user_id depuis subscriptions
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (sub) {
          if (subscription.status === 'active') {
            console.log('✅ Abonnement renouvelé pour user:', sub.user_id);
            
            // Les dates peuvent être dans items.data[0] ou directement dans subscription
            const subscriptionItem = subscription.items?.data?.[0];
            const periodEndTimestamp = subscriptionItem?.current_period_end || subscription.current_period_end;
            const periodStartTimestamp = subscriptionItem?.current_period_start || subscription.current_period_start;
            
            if (!periodEndTimestamp || !periodStartTimestamp) {
              console.error('❌ Dates manquantes dans subscription:', subscription.id);
              break;
            }
            
            // Utiliser les vraies dates de Stripe
            const periodEnd = new Date(periodEndTimestamp * 1000);
            const periodStart = new Date(periodStartTimestamp * 1000);
            
            // Mettre à jour premium_until avec la vraie date de fin de période
            await supabase
              .from('profiles')
              .update({
                is_premium: true,
                premium_until: periodEnd.toISOString(),
              })
              .eq('id', sub.user_id);

            // Mettre à jour subscription avec les vraies dates de Stripe
            await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_start: periodStart.toISOString(),
                current_period_end: periodEnd.toISOString(),
              })
              .eq('stripe_customer_id', customerId);
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            console.log('❌ Abonnement annulé/impayé pour user:', sub.user_id);
            await supabase.rpc('deactivate_premium', {
              user_id_param: sub.user_id,
            });

            // Mettre à jour le statut
            await supabase
              .from('subscriptions')
              .update({ status: subscription.status })
              .eq('stripe_customer_id', customerId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Récupérer le user_id
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (sub) {
          console.log('❌ Abonnement supprimé pour user:', sub.user_id);
          await supabase.rpc('deactivate_premium', {
            user_id_param: sub.user_id,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log('❌ Paiement échoué pour customer:', customerId);
        // Optionnel : envoyer un email à l'utilisateur
        break;
      }

      default:
        console.log('ℹ️ Événement non géré:', event.type);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erreur traitement webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
