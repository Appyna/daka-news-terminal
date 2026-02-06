import { API_BASE_URL } from '../constants';
import { Article, Source } from '../types';

export const apiService = {
  async getFeeds(sourceName: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE_URL}/feeds/${sourceName}`);
    if (!response.ok) throw new Error('Failed to fetch feeds');
    return response.json();
  },

  async getFeedsByCategory(category: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE_URL}/feeds/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch feeds by category');
    return response.json();
  },

  async getSources(): Promise<Source[]> {
    const response = await fetch(`${API_BASE_URL}/sources`);
    if (!response.ok) throw new Error('Failed to fetch sources');
    return response.json();
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
};
