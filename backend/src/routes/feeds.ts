import { Router, Request, Response } from 'express';
import { getArticlesBySource, getArticlesByCategory } from '../services/database';

const router = Router();

/**
 * GET /api/feeds/:source
 * Récupérer les articles d'une source spécifique
 */
router.get('/:source', async (req: Request, res: Response) => {
  try {
    const { source } = req.params;
    const articles = await getArticlesBySource(source);

    res.json({
      success: true,
      source,
      count: articles.length,
      articles
    });
  } catch (error: any) {
    console.error('❌ Erreur route /feeds/:source:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/feeds/category/:category
 * Récupérer tous les articles d'une catégorie
 */
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    if (!['Israel', 'France', 'Monde'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Catégorie invalide. Valeurs: Israel, France, Monde'
      });
    }

    const articles = await getArticlesByCategory(category);

    res.json({
      success: true,
      category,
      count: articles.length,
      articles
    });
  } catch (error: any) {
    console.error('❌ Erreur route /feeds/category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
