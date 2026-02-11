import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import rateLimit from 'express-rate-limit';

// Config
import { initSentry } from './config/sentry';
import { supabase } from './config/supabase';

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
import { startAllCrons } from './cron/collector';

// Cache pour /api/news avec protection contre les race conditions
import { getArticlesByCategory } from './services/database';
let newsCache: any[] | null = null;
let newsCacheTimestamp = 0;
let isRefreshing = false; // 🔒 Lock pour éviter les double-fetches simultanés
const NEWS_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Helper function to fetch all articles from database
async function fetchAllArticles(): Promise<any[]> {
  const categories = ['France', 'Israel', 'Monde'];
  let allArticles: any[] = [];
  for (const cat of categories) {
    const articles = await getArticlesByCategory(cat);
    allArticles = allArticles.concat(articles);
  }
  // Tri par date décroissante
  allArticles.sort((a, b) => new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime());
  return allArticles;
}

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

// 🛡️ RATE LIMITING : Protection anti-DDoS sur /api/news
const newsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req) => {
    // Limite plus souple si cache valide (30 req/min), stricte sinon (10 req/min)
    const now = Date.now();
    const cacheValid = newsCache !== null && (now - newsCacheTimestamp) < NEWS_CACHE_DURATION;
    return cacheValid ? 30 : 10;
  },
  message: { success: false, error: 'Trop de requêtes, réessayez dans 1 minute' },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Endpoint /api/news avec cache 3min (SANS filtrage backend)
// ⚠️ Le filtrage premium se fait côté frontend pour afficher les locks
app.get('/api/news', newsRateLimiter, async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const now = Date.now();
  
  try {
    // Récupérer depuis le cache si valide
    let allArticles: any[];
    if (newsCache && (now - newsCacheTimestamp) < NEWS_CACHE_DURATION) {
      allArticles = newsCache;
    } else {
      // 🔒 LOCK : Attendre si un refresh est déjà en cours (race condition fix)
      if (isRefreshing) {
        // Attendre max 5s que le refresh en cours termine
        let waited = 0;
        while (isRefreshing && waited < 5000) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waited += 100;
        }
        // Si cache est maintenant valide, l'utiliser
        if (newsCache && (Date.now() - newsCacheTimestamp) < NEWS_CACHE_DURATION) {
          allArticles = newsCache;
        } else {
          // Sinon forcer un refresh (le lock a expiré)
          isRefreshing = true;
          allArticles = await fetchAllArticles();
          newsCache = allArticles;
          newsCacheTimestamp = Date.now();
          isRefreshing = false;
        }
      } else {
        // Aucun refresh en cours, on le fait
        isRefreshing = true;
        try {
          allArticles = await fetchAllArticles();
          newsCache = allArticles;
          newsCacheTimestamp = Date.now();
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Vérifier le statut premium de l'utilisateur
    let isPremium = false;
    if (userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', userId)
          .single();
        isPremium = profile?.subscription_tier === 'PREMIUM';
      } catch (err) {
        console.error('❌ Error checking premium status:', err);
      }
    }

    // ✅ Retourner TOUS les articles (filtrage côté frontend)
    return res.json({
      success: true,
      cached: newsCache && (now - newsCacheTimestamp) < NEWS_CACHE_DURATION,
      articles: allArticles,
      isPremium
    });
  } catch (error: any) {
    console.error('❌ Erreur /api/news:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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
