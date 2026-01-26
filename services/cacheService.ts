import { NewsItem } from '../types';

interface CachedArticle extends NewsItem {
  fetchedAt: number; // Timestamp quand l'article a été récupéré
  translatedAt?: number; // Timestamp quand il a été traduit
}

interface SourceCache {
  [sourceKey: string]: CachedArticle[];
}

const CACHE_KEY = 'daka_news_cache';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

/**
 * Récupérer le cache depuis localStorage
 */
function getCache(): SourceCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Erreur lecture cache:', error);
    return {};
  }
}

/**
 * Sauvegarder le cache dans localStorage
 */
function saveCache(cache: SourceCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Erreur sauvegarde cache:', error);
  }
}

/**
 * Nettoyer les articles de plus de 24h
 */
function cleanOldArticles(articles: CachedArticle[]): CachedArticle[] {
  const cutoffTime = Date.now() - MAX_AGE;
  return articles.filter(article => {
    // Utiliser pubDate si disponible, sinon fetchedAt
    const articleTime = article.pubDate || article.fetchedAt;
    return articleTime >= cutoffTime;
  });
}

/**
 * Fusionner les nouveaux articles avec le cache existant
 * @param sourceKey Clé unique de la source (ex: "Israel-Ynet")
 * @param newArticles Nouveaux articles du flux RSS
 * @returns Articles fusionnés et triés (sans doublons)
 */
export function mergeWithCache(sourceKey: string, newArticles: NewsItem[]): NewsItem[] {
  const cache = getCache();
  const now = Date.now();
  
  // Récupérer les articles existants pour cette source
  let existingArticles = cache[sourceKey] || [];
  
  // Nettoyer les anciens articles (>24h)
  existingArticles = cleanOldArticles(existingArticles);
  
  // Créer un Map unique par ID pour déduplication totale
  const articlesMap = new Map<string, CachedArticle>();
  
  // D'abord, ajouter tous les articles existants dans la Map
  existingArticles.forEach(article => {
    articlesMap.set(article.id, article);
  });
  
  // Ensuite, ajouter/mettre à jour avec les nouveaux articles
  newArticles.forEach(article => {
    const existing = articlesMap.get(article.id);
    
    if (existing) {
      // Article déjà en cache - mettre à jour avec les nouvelles données mais garder fetchedAt original
      articlesMap.set(article.id, {
        ...article,
        translation: existing.translation || article.translation, // Garder traduction existante
        fetchedAt: existing.fetchedAt, // Garder date de première récupération
        translatedAt: existing.translatedAt
      });
    } else {
      // Nouvel article
      articlesMap.set(article.id, {
        ...article,
        fetchedAt: now,
        translatedAt: article.translation && article.translation !== article.title ? now : undefined
      });
    }
  });
  
  // Convertir la Map en tableau (garantit l'unicité)
  const uniqueArticles = Array.from(articlesMap.values());
  
  // Nettoyer à nouveau pour être sûr
  const cleanedArticles = cleanOldArticles(uniqueArticles);
  
  // Trier par date de publication (plus récent en premier)
  cleanedArticles.sort((a, b) => (b.pubDate || b.fetchedAt) - (a.pubDate || a.fetchedAt));
  
  // Sauvegarder dans le cache
  cache[sourceKey] = cleanedArticles;
  saveCache(cache);
  
  // Retourner sans les métadonnées de cache
  return cleanedArticles.map(({ fetchedAt, translatedAt, ...article }) => article);
}

/**
 * Obtenir les statistiques du cache
 */
export function getCacheStats(): {
  totalArticles: number;
  sourceCount: number;
  oldestArticle: number | null;
  newestArticle: number | null;
} {
  const cache = getCache();
  let totalArticles = 0;
  let oldestArticle: number | null = null;
  let newestArticle: number | null = null;
  
  Object.values(cache).forEach(articles => {
    totalArticles += articles.length;
    
    articles.forEach(article => {
      const time = article.pubDate || article.fetchedAt;
      if (oldestArticle === null || time < oldestArticle) {
        oldestArticle = time;
      }
      if (newestArticle === null || time > newestArticle) {
        newestArticle = time;
      }
    });
  });
  
  return {
    totalArticles,
    sourceCount: Object.keys(cache).length,
    oldestArticle,
    newestArticle
  };
}

/**
 * Vider complètement le cache
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cache vidé avec succès');
  } catch (error) {
    console.error('Erreur vidage cache:', error);
  }
}

/**
 * Nettoyer le cache de toutes les sources (supprimer les articles >24h)
 */
export function cleanCache(): void {
  const cache = getCache();
  const cleanedCache: SourceCache = {};
  
  Object.entries(cache).forEach(([sourceKey, articles]) => {
    const cleaned = cleanOldArticles(articles);
    if (cleaned.length > 0) {
      cleanedCache[sourceKey] = cleaned;
    }
  });
  
  saveCache(cleanedCache);
  console.log('Cache nettoyé (articles >24h supprimés)');
}
