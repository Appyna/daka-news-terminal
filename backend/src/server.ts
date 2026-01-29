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

// CRON
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
app.use('/api/admin', adminRouter);

// 🧪 Route de test Sentry
app.get('/api/test-sentry', (req: Request, res: Response) => {
  throw new Error('🧪 Test Sentry - Cette erreur est volontaire pour vérifier le monitoring');
});

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
