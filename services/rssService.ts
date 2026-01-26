import { NewsItem } from '../types';
import { translateBatch } from './translationService';

interface RSSFeed {
  url: string;
  country: string;
  source: string;
  color: string;
}

// Configuration des flux RSS
export const RSS_FEEDS: RSSFeed[] = [
  {
    url: '/rss/rss/category/1',  // Via proxy Vite
    country: 'Israel',
    source: 'Mivzakim',
    color: '#F5C518'
  }
  // Ajouter d'autres flux ici
];

export async function fetchRSSFeed(feedUrl: string, country: string, source: string, color: string, skipTranslation: boolean = false): Promise<NewsItem[]> {
  try {
    const response = await fetch(feedUrl);
    const text = await response.text();
    
    // Parser XML avec DOMParser natif
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item');
    const newsItems: NewsItem[] = [];
    const titlesToTranslate: string[] = [];
    
    // Limite de 24 heures (en millisecondes)
    const maxAge = 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - maxAge;
    
    items.forEach((item, index) => {
      let title = item.querySelector('title')?.textContent || 'Sans titre';
      let description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent;
      const link = item.querySelector('link')?.textContent || '';
      
      // Si pas de pubDate, utiliser l'index comme ordre (les flux RSS sont généralement déjà triés)
      const date = pubDate ? new Date(pubDate) : new Date(Date.now() - (index * 60000)); // 1 minute d'écart entre chaque
      
      // Filtrer les articles de plus de 24 heures
      if (date.getTime() < cutoffTime) return;
      
      // Convertir en heure locale de l'utilisateur
      const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      // Nettoyer le titre et la description des balises HTML
      title = title
        .replace(/<[^>]*>/g, '')  // Supprimer toutes les balises HTML
        .replace(/&nbsp;/g, ' ')  // Remplacer &nbsp; par espace
        .replace(/&amp;/g, '&')   // Remplacer &amp; par &
        .replace(/&quot;/g, '"')  // Remplacer &quot; par "
        .replace(/&apos;/g, "'")  // Remplacer &apos; par '
        .replace(/&lt;/g, '<')    // Remplacer &lt; par <
        .replace(/&gt;/g, '>')    // Remplacer &gt; par >
        .trim();
      
      description = description
        .replace(/<[^>]*>/g, '')  // Supprimer toutes les balises HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      
      titlesToTranslate.push(title);
      
      // Limiter la description à 150 caractères pour le modal
      const shortDescription = description ? description.substring(0, 150) + '...' : title;
      
      newsItems.push({
        id: `${source}-${index}-${date.getTime()}`,
        time,
        title,
        translation: title, // Sera remplacé par la traduction
        source,
        priority: index < 3 ? "high" as const : "normal" as const,
        color: index < 3 ? color : "#FFFFFF",
        country,
        content: shortDescription,
        tags: ["RSS", country],
        pubDate: date.getTime() // Timestamp pour tri
      });
    });
    
    // Traduire tous les titres avec cache (sauf si skipTranslation)
    if (!skipTranslation) {
      const translations = await translateBatch(titlesToTranslate);
      newsItems.forEach((item, index) => {
        const originalTitle = item.title;
        const translatedTitle = translations[index] || item.title;
        
        // Inverser : traduction en titre principal, original en sous-titre
        item.title = translatedTitle;
        item.translation = originalTitle;
      });
    }
    
    // Trier par date décroissante (plus récent en premier) APRÈS traduction
    newsItems.sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0));
    
    return newsItems;
  } catch (error) {
    console.error(`Erreur lors du chargement du flux ${source}:`, error);
    return [];
  }
}

export async function fetchAllRSSFeeds(): Promise<Map<string, NewsItem[]>> {
  const results = new Map<string, NewsItem[]>();
  
  await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      const items = await fetchRSSFeed(feed.url, feed.country, feed.source, feed.color);
      const key = `${feed.country}-${feed.source}`;
      results.set(key, items);
    })
  );
  
  return results;
}
