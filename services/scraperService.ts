import { NewsItem } from '../types';
import { translateBatch } from './translationService';

interface ScrapedArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  timestamp: number;
}

/**
 * Scraper StreetInsider Reuters avec système de cache et retry
 * Rafraîchit toutes les 60 secondes
 */
export async function fetchStreetInsider(country: string, source: string, color: string): Promise<NewsItem[]> {
  try {
    const response = await fetch('/api/scraper/streetinsider');
    const data = await response.json();
    
    if (!data.success || !data.articles) {
      console.error('StreetInsider scraper error:', data.error);
      return [];
    }

    const articles: ScrapedArticle[] = data.articles;
    const newsItems: NewsItem[] = [];
    const titlesToTranslate: string[] = [];
    
    articles.forEach((article, index) => {
      const date = new Date(article.pubDate);
      const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      titlesToTranslate.push(article.title);
      
      // Limiter à 150 caractères
      const shortTitle = article.title.length > 150 ? article.title.substring(0, 150) + '...' : article.title;
      
      newsItems.push({
        id: article.id,
        time,
        title: article.title,
        translation: article.title, // Sera remplacé par la traduction
        source,
        priority: index < 3 ? "high" as const : "normal" as const,
        color: index < 3 ? color : "#FFFFFF",
        country,
        content: shortTitle,
        tags: ["Reuters", country],
        pubDate: article.timestamp
      });
    });
    
    // Trier par date décroissante (plus récent en premier)
    newsItems.sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0));
    
    // Traduire tous les titres
    const translations = await translateBatch(titlesToTranslate);
    newsItems.forEach((item, index) => {
      const originalTitle = item.title;
      const translatedTitle = translations[index] || item.title;
      
      // Titre en français, original en sous-titre
      item.title = translatedTitle;
      item.translation = originalTitle;
    });
    
    return newsItems;
  } catch (error) {
    console.error(`Erreur lors du chargement de StreetInsider:`, error);
    return [];
  }
}
