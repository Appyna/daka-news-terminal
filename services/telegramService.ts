import { NewsItem } from '../types';
import { translateBatch } from './translationService';

interface TelegramMessage {
  id: number;
  text: string;
  date: number;
  timestamp: string;
}

export async function fetchTelegramChannel(channel: string, country: string, source: string, color: string, skipTranslation: boolean = false): Promise<NewsItem[]> {
  try {
    const response = await fetch(`/api/telegram/${channel}`);
    const data = await response.json();
    
    if (!data.success || !data.messages) {
      console.error('Telegram API error:', data.error);
      return [];
    }

    const messages: TelegramMessage[] = data.messages;
    const newsItems: NewsItem[] = [];
    const textsToTranslate: string[] = [];
    
    messages.forEach((msg, index) => {
      if (!msg.text) return;
      
      const date = new Date(msg.timestamp);
      const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      textsToTranslate.push(msg.text);
      
      // Limiter à 150 caractères
      const shortText = msg.text.length > 150 ? msg.text.substring(0, 150) + '...' : msg.text;
      
      newsItems.push({
        id: `telegram-${channel}-${msg.id}`,
        time,
        title: msg.text,
        translation: msg.text, // Sera remplacé par la traduction
        source,
        priority: index < 3 ? "high" as const : "normal" as const,
        color: index < 3 ? color : "#FFFFFF",
        country,
        content: shortText,
        tags: ["Telegram", country],
        pubDate: date.getTime() // Timestamp pour tri
      });
    });
    
    // Trier par date décroissante (plus récent en premier)
    newsItems.sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0));
    
    // Traduire tous les messages (sauf si skipTranslation)
    if (!skipTranslation) {
      const translations = await translateBatch(textsToTranslate);
      newsItems.forEach((item, index) => {
        const originalText = item.title;
        const translatedText = translations[index] || item.title;
        
        // Titre en français, original en sous-titre
        item.title = translatedText;
        item.translation = originalText;
      });
    }
    
    return newsItems;
  } catch (error) {
    console.error(`Erreur lors du chargement du channel Telegram ${channel}:`, error);
    return [];
  }
}
