/**
 * Service Stripe pour gérer les abonnements Premium
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PortalSessionParams {
  customerId: string;
}

export interface PortalSessionResponse {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Crée une session de paiement Stripe Checkout
 * Redirige l'utilisateur vers la page de paiement Stripe
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Erreur lors de la création de la session de paiement',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur createCheckoutSession:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

/**
 * Crée une session du portail client Stripe
 * Permet à l'utilisateur de gérer son abonnement (annuler, modifier, etc.)
 */
export async function createPortalSession(
  params: PortalSessionParams
): Promise<PortalSessionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/stripe/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Erreur lors de la création de la session du portail',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur createPortalSession:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

/**
 * Redirige vers Stripe Checkout
 */
export async function redirectToCheckout(userId: string, userEmail: string): Promise<void> {
  const result = await createCheckoutSession({ userId, userEmail });
  
  if (result.success && result.url) {
    window.location.href = result.url;
  } else {
    throw new Error(result.error || 'Erreur lors de la redirection vers Stripe');
  }
}

/**
 * Redirige vers le portail client Stripe
 */
export async function redirectToPortal(customerId: string): Promise<void> {
  const result = await createPortalSession({ customerId });
  
  if (result.success && result.url) {
    window.location.href = result.url;
  } else {
    throw new Error(result.error || 'Erreur lors de la redirection vers le portail');
  }
}
