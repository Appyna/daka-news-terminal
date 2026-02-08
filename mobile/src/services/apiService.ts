import { API_BASE_URL } from '../constants';
import { Article, Source } from '../types';

export const apiService = {
  async getFeeds(sourceName: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE_URL}/feeds/${sourceName}`);
    if (!response.ok) throw new Error('Failed to fetch feeds');
    const data = await response.json();
    return data.success ? data.articles : [];
  },

  async getFeedsByCategory(category: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE_URL}/feeds/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch feeds by category');
    const data = await response.json();
    return data.success ? data.articles : [];
  },

  async getSources(): Promise<Source[]> {
    const response = await fetch(`${API_BASE_URL}/sources`);
    if (!response.ok) throw new Error('Failed to fetch sources');
    const data = await response.json();
    
    // L'API renvoie { success: true, sources: { Israel: [...], France: [...], ... } }
    // On doit flatten en un tableau de sources
    if (!data.success || !data.sources) return [];
    
    const allSources: Source[] = [];
    for (const [country, sources] of Object.entries(data.sources) as [string, any[]][]) {
      allSources.push(...sources);
    }
    return allSources;
  },

  async createStripeCheckoutSession(userId: string) {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
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
