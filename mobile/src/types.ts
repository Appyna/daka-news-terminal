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
}

export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: 'BASIC' | 'PREMIUM';
  stripe_customer_id?: string;
}
