import { createClient } from '@supabase/supabase-js';

// Variables d'environnement Supabase (frontend = ANON key, pas service_role)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('❌ Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes dans .env');
}

// Client Supabase frontend avec gestion session automatique
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types TypeScript pour les tables
export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_premium: boolean;
  premium_until?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_countries: string[];
  favorite_sources: string[];
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en' | 'he';
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

console.log('✅ Supabase client initialisé');
