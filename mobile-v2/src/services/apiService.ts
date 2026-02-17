import { API_BASE_URL } from '../constants';

interface CreateCheckoutSessionResponse {
  url: string;
  sessionId: string;
}

// Timeout wrapper pour fetch
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

export const apiService = {
  /**
   * Récupérer tous les articles (filtrés dernières 24h côté backend)
   */
  async getNews() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/news`, {}, 10000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les sources avec free_tier
   */
  async getSources() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/sources`, {}, 10000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  },

  /**
   * Créer une session Stripe Checkout (fallback web)
   */
  async createStripeCheckoutSession(
    userId: string,
    email: string
  ): Promise<CreateCheckoutSessionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
};
