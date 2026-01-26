import { Router, Request, Response } from 'express';
import { getActiveSources } from '../services/database';

const router = Router();

/**
 * GET /api/sources
 * Récupérer toutes les sources actives
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const sources = await getActiveSources();

    // Grouper par catégorie
    const grouped = sources.reduce((acc, source) => {
      if (!acc[source.category]) {
        acc[source.category] = [];
      }
      acc[source.category].push({
        name: source.name,
        color: source.color,
        free_tier: source.free_tier
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      success: true,
      total: sources.length,
      sources: grouped
    });
  } catch (error: any) {
    console.error('❌ Erreur route /sources:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
