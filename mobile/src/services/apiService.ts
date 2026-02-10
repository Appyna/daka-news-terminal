import { API_BASE_URL } from '../constants';
import { Article, Source } from '../types';
import { supabase } from './supabaseClient';

export const apiService = {
  // ✅ NOUVEAU: Récupérer tous les articles avec cache backend (3min) + filtrage premium
  async getAllNews(): Promise<Article[]> {
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
      const data = await response.json();
      return data.success ? data.articles : [];
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  // Utilise getAllNews et filtre localement par source
  async getFeeds(sourceName: string): Promise<Article[]> {
    const articles = await this.getAllNews();
    return articles.filter(a => a.source === sourceName);
  },

  async getFeedsByCategory(category: string): Promise<Article[]> {
    const articles = await this.getAllNews();
    return articles.filter(a => a.category === category);
  },

  async getSources(): Promise<Source[]> {
    const articles = await this.getAllNews();
    const sourcesMap = new Map<string, Source>();
    
    // Extraire les sources uniques des articles
    for (const article of articles) {
      const key = `${article.source}-${article.country}`;
      if (!sourcesMap.has(key)) {
        sourcesMap.set(key, {
          id: key,
          name: article.source,
          url: article.link,
          country: article.country,
          category: article.category,
          language: 'multi',
          enabled: true
        } as Source);
      }
    }
    
    return Array.from(sourcesMap.values());
  },

  async createStripeCheckoutSession(userId: string, userEmail: string) {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
  },

  async createStripePortalSession(userId: string) {
    const response = await fetch(`${API_BASE_URL}/stripe/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to create portal session');
    return response.json();
  },

  async savePushToken(deviceId: string, pushToken: string, userId?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/save-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, pushToken, userId }),
    });
    if (!response.ok) throw new Error('Failed to save push token');
  },
};
