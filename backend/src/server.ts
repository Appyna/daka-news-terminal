import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Routes
import feedsRouter from './routes/feeds';
import sourcesRouter from './routes/sources';

// CRON
import { startAllCrons } from './cron/collector';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARES
// ============================================

// Sécurité
app.use(helmet());

// Compression des réponses
app.use(compression());

// CORS (Web + iOS + Android)
app.use(cors({
  origin: [
    process.env.FRONTEND_URL_WEB || 'http://localhost:3000',
    process.env.FRONTEND_URL_IOS || 'dakanews://',
    process.env.FRONTEND_URL_ANDROID || 'dakanews://',
    '*' // Pour dev uniquement, à restreindre en prod
  ],
  credentials: true
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
