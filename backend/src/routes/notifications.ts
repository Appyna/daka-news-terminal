import { Router } from 'express';
import { supabase } from '../config/supabase';
import * as Sentry from '@sentry/node';

const router = Router();

/**
 * Interface pour Expo Push Notifications
 * Doc: https://docs.expo.dev/push-notifications/sending-notifications/
 */
interface ExpoPushMessage {
  to: string | string[];
  sound?: 'default';
  title?: string;
  body?: string;
  data?: any;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * POST /api/notifications/save-token
 * Enregistrer le push token d'un user ou appareil anonyme
 */
router.post('/save-token', async (req, res) => {
  try {
    const { deviceId, pushToken, userId } = req.body;

    if (!deviceId || !pushToken) {
      return res.status(400).json({
        success: false,
        error: 'deviceId et pushToken requis'
      });
    }

    // Sauvegarder dans Supabase (table user_push_tokens)
    // Upsert basé sur device_id (permet tokens anonymes)
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({
        device_id: deviceId,
        push_token: pushToken,
        user_id: userId || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'device_id'
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Push token enregistré'
    });
  } catch (error: any) {
    console.error('❌ Erreur save push token:', error);
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/send
 * Envoyer une notification push à un ou plusieurs users
 * (À appeler depuis le CRON quand breaking news détecté)
 */
router.post('/send', async (req, res) => {
  try {
    const { title, body, userIds, articleId } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'title et body requis'
      });
    }

    // Récupérer les push tokens des users ciblés
    let query = supabase.from('user_push_tokens').select('push_token');
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data: tokens, error } = await query;

    if (error) throw error;

    if (!tokens || tokens.length === 0) {
      return res.json({
        success: true,
        message: 'Aucun token trouvé'
      });
    }

    // Construire les messages Expo Push
    const messages: ExpoPushMessage[] = tokens.map(t => ({
      to: t.push_token,
      sound: 'default',
      title,
      body,
      data: articleId ? { articleId } : undefined,
      badge: 1,
      priority: 'high'
    }));

    // Envoyer via Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(messages)
    });

    const result = await response.json();

    console.log(`✅ ${messages.length} notification(s) envoyée(s)`);

    res.json({
      success: true,
      sent: messages.length,
      result
    });
  } catch (error: any) {
    console.error('❌ Erreur envoi notif:', error);
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/test
 * Route de test pour envoyer une notif à un user spécifique
 */
router.post('/test', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis'
      });
    }

    // Récupérer le push token du user
    const { data, error } = await supabase
      .from('user_push_tokens')
      .select('push_token')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Push token non trouvé pour ce user'
      });
    }

    // Envoyer une notif de test
    const message: ExpoPushMessage = {
      to: data.push_token,
      sound: 'default',
      title: '🔔 Test notification',
      body: 'Si tu vois ça, les notifs fonctionnent !',
      priority: 'high'
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const result = await response.json();

    res.json({
      success: true,
      message: 'Notification de test envoyée',
      result
    });
  } catch (error: any) {
    console.error('❌ Erreur test notif:', error);
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
