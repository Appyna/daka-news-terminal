import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialiser Sentry pour le monitoring d'erreurs
 */
export function initSentry() {
  const SENTRY_DSN = process.env.SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('⚠️ SENTRY_DSN manquant - Monitoring désactivé');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    
    // Performance Monitoring (gratuit jusqu'à 100k transactions/mois)
    tracesSampleRate: 0.1, // 10% des transactions (économise le quota)
    
    // Profiling (optionnel, pour performances)
    profilesSampleRate: 0.1, // 10% des transactions
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Ignorer les erreurs connues/bénignes
    ignoreErrors: [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'Rate limit', // Rate limit OpenAI = normal, pas une erreur critique
    ],

    // Avant d'envoyer, enrichir les données
    beforeSend(event, hint) {
      // Ajouter contexte utile
      if (hint.originalException) {
        console.error('🔴 Erreur capturée par Sentry:', hint.originalException);
      }
      return event;
    },
  });

  console.log('✅ Sentry initialisé - Monitoring actif');
}

/**
 * Capturer une erreur manuellement
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Capturer un message (warning, info)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Ajouter un breadcrumb (historique d'actions avant erreur)
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data,
  });
}
