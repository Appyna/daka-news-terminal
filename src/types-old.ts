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
  pubDate?: number;
  url?: string;
}

export interface NewsColumn {
  id: string;
  media: string;
  backgroundColor: string;
  headerColor: string;
  items: NewsItem[];
}
