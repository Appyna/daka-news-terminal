import cron from 'node-cron';
import { getActiveSources, cleanupOldArticles } from '../services/database';
import { collectAllSources } from '../services/rssCollector';

/**
 * Job de collecte RSS (toutes les 3 minutes par défaut)
 */
export function startRSSCollectionCron() {
  const intervalSeconds = parseInt(process.env.RSS_FETCH_INTERVAL_SECONDS || '180');
  const cronExpression = `*/${Math.floor(intervalSeconds / 60)} * * * *`;

  console.log(`⏰ CRON RSS: Toutes les ${intervalSeconds}s (${cronExpression})`);

  cron.schedule(cronExpression, async () => {
    try {
      console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Démarrage collecte RSS...`);
      
      const sources = await getActiveSources();
      await collectAllSources(sources);
      
      // Nettoyage immédiatement après la collecte
      console.log(`🧹 Nettoyage articles >24h...`);
      const deletedCount = await cleanupOldArticles();
      console.log(`✅ ${deletedCount} articles supprimés\n`);
      
      console.log('✅ Collecte RSS terminée\n');
    } catch (error) {
      console.error('❌ Erreur CRON RSS:', error);
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
