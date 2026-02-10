// Ajout pour /api/news avec cache 3min
import { getArticlesByCategory } from './services/database';
// Cache global pour les news (24h)
let newsCache: any[] | null = null;
let newsCacheTimestamp = 0;
const NEWS_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Config
import { initSentry } from './config/sentry';

// Routes
import feedsRouter from './routes/feeds';
import sourcesRouter from './routes/sources';
import adminRouter from './routes/admin';
import stripeRouter from './routes/stripe';
import webhooksRouter from './routes/webhooks';
import appleWebhooksRouter from './routes/apple-webhooks';
import googleWebhooksRouter from './routes/google-webhooks';
import notificationsRouter from './routes/notifications';

// CRON

// ...initialisation de dotenv, Sentry, etc...

const app = express();

// ...middlewares, routes, etc...

// Endpoint /api/news avec cache 3min (doit être après la création de app)
app.get('/api/news', async (req: Request, res: Response) => {
  const now = Date.now();
  if (newsCache && (now - newsCacheTimestamp) < NEWS_CACHE_DURATION) {
    return res.json({
      success: true,
      cached: true,
      articles: newsCache
    });
  }
  try {
    // Récupérer les articles par catégorie (France, Israel, Monde)
    const categories = ['France', 'Israel', 'Monde'];
    let allArticles: any[] = [];
    for (const cat of categories) {
      const articles = await getArticlesByCategory(cat);
      allArticles = allArticles.concat(articles);
    }
    // Tri par date décroissante
    allArticles.sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
    newsCache = allArticles;
    newsCacheTimestamp = now;
    return res.json({
      success: true,
      cached: false,
      articles: allArticles
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
import { startAllCrons } from './cron/collector';

dotenv.config();

// 🔴 SENTRY - Initialiser en premier (avant tout le reste)
initSentry();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARES
// ============================================

// Sécurité
app.use(helmet());

// Compression des réponses
app.use(compression());

// CORS - Autoriser toutes les origines
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ⚠️ IMPORTANT : Webhook Stripe doit être AVANT express.json()
// Car Stripe a besoin du raw body
app.use('/api/webhooks', webhooksRouter);
app.use('/api/webhooks', appleWebhooksRouter);
app.use('/api/webhooks', googleWebhooksRouter);

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'DAKA News Terminal API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/feeds', feedsRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/admin', adminRouter);app.use('/api/stripe', stripeRouter);
app.use('/api/notifications', notificationsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Erreur serveur:', err);
  
  // Capturer l'erreur dans Sentry
  Sentry.captureException(err);
  
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ============================================
// DÉMARRAGE
// ============================================

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🚀 DAKA NEWS TERMINAL - BACKEND API    ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`🌐 Serveur: http://localhost:${PORT}`);
  console.log(`📱 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Supabase: ${process.env.SUPABASE_URL}\n`);

  // Démarrer les CRONs
  startAllCrons();
});

// Gestion graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du serveur...');
  process.exit(0);
});

export default app;
