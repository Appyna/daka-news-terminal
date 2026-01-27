import type { Feed, Article } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://daka-news-backend.onrender.com/api'

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
 */
export async function fetchAllFeeds(): Promise<Feed[]> {
  try {
    const sourcesData = await fetchSources()
    
    if (!sourcesData.success) {
      throw new Error('Échec récupération sources')
    }
    
    const feeds: Feed[] = []
    
    // Traiter chaque catégorie
    for (const [category, sources] of Object.entries(sourcesData.sources)) {
      // Récupérer les articles de chaque source
      await Promise.all(
        sources.map(async (sourceInfo) => {
          try {
            const feedData = await fetchArticlesBySource(sourceInfo.name)
            
            if (feedData.success && feedData.articles.length > 0) {
              // Convertir les articles
              const articles = feedData.articles.map(article =>
                convertBackendArticle(article, sourceInfo.name, category)
              )
              
              feeds.push({
                id: `${category}-${sourceInfo.name}`,
                name: sourceInfo.name,
                country: category,
                source: sourceInfo.name,
                articles
              })
            }
          } catch (error) {
            console.error(`Erreur source ${sourceInfo.name}:`, error)
            // Continue avec les autres sources
          }
        })
      )
    }
    
    return feeds
  } catch (error) {
    console.error('❌ Erreur fetchAllFeeds:', error)
    return []
  }
}
