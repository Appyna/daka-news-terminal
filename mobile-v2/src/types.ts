export interface Article {
  id: string;
  title: string;
  title_original: string;
  link: string;
  pub_date: string;
  source: string;
  country: string;
  category: string;
  translation?: string;
  content?: string;
  image_url?: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  country: string;
  category: string;
  language: string;
  enabled: boolean;
  free_tier: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  is_premium: boolean;
  premium_until?: string;
  stripe_customer_id?: string;
  created_at: string;
}

export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isPremium: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
