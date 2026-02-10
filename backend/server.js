import { getArticlesByCategory } from './src/services/database.js';
// Cache global pour les news (24h)
let newsCache = null;
let newsCacheTimestamp = 0;
const NEWS_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Endpoint /api/news : renvoie tous les articles des 24h, avec cache
app.get('/api/news', async (req, res) => {
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
    let allArticles = [];
    for (const cat of categories) {
      const articles = await getArticlesByCategory(cat);
      allArticles = allArticles.concat(articles);
    }
    // Tri par date décroissante
    allArticles.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
    newsCache = allArticles;
    newsCacheTimestamp = now;
    return res.json({
      success: true,
      cached: false,
      articles: allArticles
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { scrapeStreetInsider } from './streetinsiderScraper.js';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wzqhrothppyktowwllkr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Cache global pour les news
let newsCache = null;
let newsCacheTimestamp = 0;
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Fonction pour récupérer les messages via RSSHub (channels publics)
async function getTelegramChannelMessages(channelUsername) {
  // Exemple de route pour les news (à adapter selon ta logique)
  app.get('/api/news', async (req, res) => {
    const now = Date.now();
    if (newsCache && (now - newsCacheTimestamp) < CACHE_DURATION) {
      return res.json(newsCache);
    }
    // Ici, tu récupères et traites tous tes flux RSS (existant)
    try {
      // ... logique pour fetch et parser tous les flux RSS ...
      // newsData = { ... }
      // newsCache = newsData;
      // newsCacheTimestamp = now;
      // return res.json(newsData);
      res.status(501).json({ error: 'Logique à compléter pour fetch les flux RSS.' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });
  const now = Date.now();
  const cacheKey = channelUsername;
  
  // Retourner le cache si encore valide
  const cached = channelCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.messages;
  }

  try {
    // Telegram Web Preview API (public, sans auth)
    const url = `https://t.me/s/${channelUsername}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Telegram returned ${response.status}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extraire les messages depuis le HTML
    const messageElements = document.querySelectorAll('.tgme_widget_message');
    
    const messages = Array.from(messageElements).slice(0, 25).map((elem, index) => {
      const textElem = elem.querySelector('.tgme_widget_message_text');
      const timeElem = elem.querySelector('.tgme_widget_message_date time');
      const linkElem = elem.querySelector('.tgme_widget_message_date');
      
      let text = textElem ? textElem.textContent.trim() : '';
      
      // Nettoyer les URLs et textes superflus
      text = text
        .replace(/https?:\/\/[^\s]+/g, '') // Supprimer les URLs
        .replace(/t\.me\/[^\s]+/g, '')     // Supprimer les liens t.me
        .replace(/מבזקים בטלגרם/g, '')      // Supprimer "מבזקים בטלגרם"
        .replace(/\s+/g, ' ')              // Normaliser les espaces
        .trim();
      
      const datetime = timeElem ? timeElem.getAttribute('datetime') : new Date().toISOString();
      const date = new Date(datetime);
      const link = linkElem ? linkElem.getAttribute('href') : '';
      
      return {
        id: `${channelUsername}-${index}-${date.getTime()}`,
        text: text,
        date: Math.floor(date.getTime() / 1000),
        timestamp: date.toISOString(),
        link: link || ''
      };
    }).filter(msg => msg.text.length > 0);

    // Mettre en cache
    channelCache.set(cacheKey, {
      messages,
      timestamp: now
    });
    
    return messages;
  } catch (error) {
    console.error('Error fetching Telegram channel via RSSHub:', error);
    throw error;
  }
}

// Endpoint pour récupérer les messages
app.get('/api/telegram/:channel', async (req, res) => {
  try {
    const channel = req.params.channel;
    const cached = channelCache.get(channel);
    const isCached = cached && (Date.now() - cached.timestamp) < CACHE_DURATION;
    
    const messages = await getTelegramChannelMessages(channel);
    
    res.json({
      success: true,
      channel,
      messages,
      cached: isCached,
      source: 'RSSHub'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Note: L'ancien scraper fetch a été remplacé par Playwright (streetinsiderScraper.js)

// Cache pour StreetInsider
const streetInsiderCache = { data: null, timestamp: 0 };
const STREETINSIDER_CACHE_DURATION = 60000; // 60 secondes

// Endpoint StreetInsider
app.get('/api/scraper/streetinsider', async (req, res) => {
  try {
    const now = Date.now();
    
    // Retourner le cache si valide
    if (streetInsiderCache.data && (now - streetInsiderCache.timestamp) < STREETINSIDER_CACHE_DURATION) {
      return res.json({
        success: true,
        articles: streetInsiderCache.data,
        cached: true,
        timestamp: new Date(streetInsiderCache.timestamp).toISOString()
      });
    }
    
    // Scraper le site
    const articles = await scrapeStreetInsider();
    
    // Mettre en cache
    streetInsiderCache.data = articles;
    streetInsiderCache.timestamp = now;
    
    res.json({
      success: true,
      articles: articles,
      cached: false,
      timestamp: new Date(now).toISOString()
    });
  } catch (error) {
    console.error('❌ [StreetInsider] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔔 NOTIFICATIONS - Save push token
app.post('/api/notifications/save-token', async (req, res) => {
  try {
    const { deviceId, pushToken, userId } = req.body;

    if (!deviceId || !pushToken) {
      return res.status(400).json({
        success: false,
        error: 'deviceId et pushToken requis'
      });
    }

    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({
        device_id: deviceId,
        push_token: pushToken,
        user_id: userId || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'device_id'
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Push token enregistré'
    });
  } catch (error) {
    console.error('❌ Erreur save token:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    provider: 'RSSHub',
    channels_cached: channelCache.size,
    streetinsider_cached: !!streetInsiderCache.data,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Telegram Backend (RSSHub) running on http://localhost:${PORT}`);
  console.log(`📱 No configuration needed - works with public Telegram channels`);
  console.log(`✅ Test: http://localhost:${PORT}/api/telegram/arutz7flashes`);
  console.log(`📰 StreetInsider: http://localhost:${PORT}/api/scraper/streetinsider`);
});
