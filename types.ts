
export interface NewsItem {
  id: string;
  time: string;
  title: string;
  translation: string;
  source: string;
  priority: 'high' | 'normal';
  color: string;
  country: string;
  content?: string;
  tags?: string[];
  pubDate?: number; // Timestamp pour tri chronologique
}

export interface NewsColumn {
  id: string;
  media: string;
  backgroundColor: string;
  headerColor: string;
  items: NewsItem[];
}

export interface AppState {
  onboardingComplete: boolean;
  selectedCountries: string[];
  selectedSources: string[];
  selectedLanguage: string;
  currentCountry: string;
  searchQuery: string;
  replayMode: boolean;
  replayTime: number; // 0-24 hours
}
