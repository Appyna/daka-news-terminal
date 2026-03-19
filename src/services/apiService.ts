import type { Feed, Article } from '../types'
import { supabase } from '../lib/supabase'

const API_BASE_URL = 'https://api.dakanews.com/api'

interface BackendNewsResponse {
  success: boolean
  cached: boolean
  articles: Array<BackendArticle & { source: string }>
  isPremium?: boolean
}

interface BackendArticle {
  id: string
  title: string
  title_original: string
  translation: string | null
  content: string | null
  link: string
  pub_date: string
  priority: 'high' | 'normal'
  color: string
  country: string
}

interface BackendFeedResponse {
  success: boolean
  source: string
  count: number
  articles: BackendArticle[]
}

export async function getAllNews(): Promise<BackendNewsResponse> {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Appeler le backend avec userId pour filtrage premium
    const url = userId 
      ? `${API_BASE_URL}/news?userId=${userId}`
      : `${API_BASE_URL}/news`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch news');
    
    const data: BackendNewsResponse = await response.json();
    return data; // Retourner l'objet complet
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

interface BackendSourcesResponse {
  success: boolean
  sources: {
    Israel: Array<{ name: string; color: string; free_tier: boolean }>
    France: Array<{ name: string; color: string; free_tier: boolean }>
    Monde: Array<{ name: string; color: string; free_tier: boolean }>
  }
}

/**
 * Récupère toutes les sources disponibles
 */
export async function fetchSources(): Promise<BackendSourcesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sources`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Erreur fetchSources:', error)
    throw error
  }
}

/**
 * Récupère les articles d'une source spécifique
 */
export async function fetchArticlesBySource(sourceName: string): Promise<BackendFeedResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/feeds/${encodeURIComponent(sourceName)}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error(`❌ Erreur fetchArticlesBySource(${sourceName}):`, error)
    throw error
  }
}

/**
 * Récupère les articles d'une catégorie (Israel, France, Monde)
 */
export async function fetchArticlesByCategory(category: string): Promise<BackendFeedResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/feeds/category/${encodeURIComponent(category)}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error(`❌ Erreur fetchArticlesByCategory(${category}):`, error)
    throw error
  }
}

/**
 * Convertit un article backend en article frontend
 */
function convertBackendArticle(backendArticle: BackendArticle, source: string, country: string): Article {
  const pubDate = new Date(backendArticle.pub_date)
  
  return {
    id: backendArticle.id,
    title: backendArticle.translation || backendArticle.title, // Traduit en priorité
    summary: backendArticle.content || backendArticle.title_original,
    content: backendArticle.content || backendArticle.title_original,
    source,
    country,
    url: backendArticle.link,
    publishedAt: pubDate.toISOString(),
    translated: !!backendArticle.translation
  }
}

/**
 * Récupère tous les feeds organisés par catégorie
 * ✅ Utilise getAllNews() avec cache backend pour éviter surcharge
 */
export async function fetchAllFeeds(): Promise<Feed[]> {
  try {
    // ✅ Récupérer tous les articles via /api/news (avec cache 3min)
    const newsData = await getAllNews()
    
    if (!newsData.success || !newsData.articles) {
      throw new Error('Échec récupération articles')
    }
    
    // Grouper les articles par source et pays
    const feedsMap = new Map<string, Feed>()
    
    for (const article of newsData.articles) {
      const feedKey = `${article.country}-${article.source}`
      
      if (!feedsMap.has(feedKey)) {
        feedsMap.set(feedKey, {
          id: feedKey,
          name: article.source,
          country: article.country,
          source: article.source,
          articles: []
        })
      }
      
      const feed = feedsMap.get(feedKey)!
      feed.articles.push(convertBackendArticle(article, article.source, article.country))
    }
    
    return Array.from(feedsMap.values())
  } catch (error) {
    console.error('❌ Erreur fetchAllFeeds:', error)
    return []
  }
}
