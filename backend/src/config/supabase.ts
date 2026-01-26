import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validation des variables d'environnement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('❌ Variables SUPABASE manquantes dans .env');
}

// Client Supabase avec service_role (full access backend)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Types pour TypeScript
export interface Source {
  id: number;
  name: string;
  rss_url: string;
  category: 'Israel' | 'France' | 'Monde';
  color: string;
  active: boolean;
  free_tier: boolean;
  refresh_interval: number;
  skip_translation: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  source_id: number;
  title: string;
  title_original: string;
  translation: string | null;
  content: string | null;
  link: string;
  pub_date: string;
  priority: 'high' | 'normal';
  color: string;
  country: string;
  created_at: string;
}

export interface TranslationCache {
  id: number;
  original_text: string;
  translated_text: string;
  from_lang: string;
  to_lang: string;
  created_at: string;
}

console.log('✅ Supabase connecté:', SUPABASE_URL);
