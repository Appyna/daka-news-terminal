import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
});

/**
 * POST /api/stripe/create-checkout-session
 * Crée une session Stripe Checkout pour l'abonnement Premium
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'userId et userEmail sont requis',
      });
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({
        success: false,
        error: 'STRIPE_PRICE_ID non configuré',
      });
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    console.log('✅ Session Stripe créée:', session.id, 'pour user:', userId);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Erreur création session Stripe:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/stripe/create-portal-session
 * Crée une session Customer Portal pour gérer l'abonnement
 * Version: 2026-02-04
 */
router.post('/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis',
      });
    }

    // Récupérer le customer_id depuis Supabase
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (error || !subscription?.stripe_customer_id) {
      return res.status(404).json({
        success: false,
        error: 'Abonnement non trouvé',
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`,
    });

    console.log('✅ Portal session créée pour customer:', subscription.stripe_customer_id);

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Erreur création portal session:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
