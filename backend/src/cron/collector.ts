import cron from 'node-cron';
import { getActiveSources, cleanupOldArticles } from '../services/database';
import { collectAllSources } from '../services/rssCollector';
import * as Sentry from '@sentry/node';

/**
 * Job de collecte RSS (toutes les 3 minutes par défaut)
 */
export function startRSSCollectionCron() {
  const intervalSeconds = parseInt(process.env.RSS_FETCH_INTERVAL_SECONDS || '120'); // 2 minutes par défaut
  const cronExpression = `*/${Math.floor(intervalSeconds / 60)} * * * *`;

  console.log(`⏰ CRON RSS: Toutes les ${intervalSeconds}s (${cronExpression})`);

  cron.schedule(cronExpression, async () => {
    try {
      console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Démarrage collecte RSS...`);
      
      const sources = await getActiveSources();
      await collectAllSources(sources);
      
      // Nettoyage après chaque collecte (respecte retention_days par source)
      console.log(`🧹 Nettoyage anciens articles...`);
      const deletedCount = await cleanupOldArticles();
      console.log(`✅ ${deletedCount} articles supprimés\n`);
      
      console.log('✅ Collecte RSS terminée\n');
    } catch (error) {
      console.error('❌ Erreur CRON RSS:', error);
      // Capturer dans Sentry (erreur critique = le backend ne collecte plus)
      Sentry.captureException(error, {
        extra: {
          job: 'RSS Collection CRON',
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  // Lancer une collecte immédiate au démarrage
  (async () => {
    console.log('🚀 Collecte initiale RSS...');
    try {
      const sources = await getActiveSources();
      await collectAllSources(sources);
      console.log('✅ Collecte initiale terminée\n');
    } catch (error) {
      console.error('❌ Erreur collecte initiale:', error);
      // Capturer dans Sentry (problème au démarrage)
      Sentry.captureException(error, {
        extra: {
          job: 'Initial RSS Collection',
          timestamp: new Date().toISOString()
        }
      });
    }
  })();
}

/**
 * Démarrer tous les CRONs
 */
export function startAllCrons() {
  startRSSCollectionCron();
  // Cleanup se fait maintenant après chaque collecte (toutes les 3 min)
  console.log('✅ Tous les CRONs démarrés\n');
}
