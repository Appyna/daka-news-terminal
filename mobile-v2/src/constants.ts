export const COLORS = {
  dark1: "#0A0918",
  dark2: "#1A1838",
  dark3: "#252550",
  accentYellow1: "#F5C518",
  accentYellow2: "#FFD93D",
  white: "#FFFFFF",
  gray: "#C0C0C0"
};

/**
 * Sources accessibles gratuitement (utilisateurs BASIC)
 * Toutes les autres sources nécessitent un abonnement Premium
 * IMPORTANT: Noms doivent matcher EXACTEMENT l'API /sources
 */
export const FREE_SOURCES = [
  "Ynet",                     // Israel
  "France Info",              // France
  "ANADOLU (Agence turque)"   // Monde
];

/**
 * API Backend URL
 */
export const API_BASE_URL = "https://api.dakanews.com/api";

/**
 * Supabase Configuration
 */
export const SUPABASE_URL = "https://wzqhrothppyktowwllkr.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWhyb3RocHB5a3Rvd3dsbGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDg5MzYsImV4cCI6MjA4NDk4NDkzNn0.R9LIdoi2uYWDLfEKICKmzUZPmutUq0RtfHGOLJHVf9c";

/**
 * Product IDs pour In-App Purchase
 */
export const IAP_PRODUCT_IDS = {
  ios: "com.dakanews.premium.monthly",
  android: "premium_monthly",
};
