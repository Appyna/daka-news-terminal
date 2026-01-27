import { Router, Request, Response } from 'express';
import { getActiveSources } from '../services/database';
import { collectAllSources } from '../services/rssCollector';

const router = Router();

/**
 * GET /api/admin/collect
 * Force une collecte immédiate de tous les flux
 */
router.get('/collect', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Collecte manuelle déclenchée...');
    const sources = await getActiveSources();
    await collectAllSources(sources);
    
    res.json({
      success: true,
      message: 'Collecte terminée',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Erreur collecte:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/status
 * Vérifie l'état du backend
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const sources = await getActiveSources();
    res.json({
      success: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      sources_count: sources.length,
      memory: process.memoryUsage(),
      env: {
        node_env: process.env.NODE_ENV,
        fetch_interval: process.env.RSS_FETCH_INTERVAL_SECONDS || '180'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
