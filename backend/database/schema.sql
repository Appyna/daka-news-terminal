-- ============================================
-- DAKA NEWS TERMINAL - DATABASE SCHEMA
-- Pour Supabase PostgreSQL
-- ============================================

-- Table: sources
-- Contient la configuration de tous les flux RSS
CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  rss_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Israel', 'France', 'Monde')),
  color TEXT DEFAULT '#FFFFFF',
  active BOOLEAN DEFAULT true,
  free_tier BOOLEAN DEFAULT false,
  refresh_interval INTEGER DEFAULT 180,
  skip_translation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: articles
-- Contient tous les articles avec historique 24h
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_original TEXT NOT NULL,
  translation TEXT,
  content TEXT,
  link TEXT NOT NULL,
  pub_date TIMESTAMPTZ NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal')),
  color TEXT DEFAULT '#FFFFFF',
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, link)
);

-- Table: translations_cache
-- Cache des traductions pour éviter de re-traduire
CREATE TABLE IF NOT EXISTS translations_cache (
  id SERIAL PRIMARY KEY,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  from_lang TEXT DEFAULT 'he',
  to_lang TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_text, from_lang, to_lang)
);

-- ============================================
-- INDEX POUR PERFORMANCES
-- ============================================

-- Index sur source_id pour récupérer articles par source
CREATE INDEX IF NOT EXISTS idx_articles_source 
  ON articles(source_id);

-- Index sur pub_date pour tri chronologique
CREATE INDEX IF NOT EXISTS idx_articles_pubdate 
  ON articles(pub_date DESC);

-- Index composite pour filtrage + tri
CREATE INDEX IF NOT EXISTS idx_articles_source_pubdate 
  ON articles(source_id, pub_date DESC);

-- Index sur created_at pour cleanup
CREATE INDEX IF NOT EXISTS idx_articles_created 
  ON articles(created_at DESC);

-- Index sur category pour filtrage sources
CREATE INDEX IF NOT EXISTS idx_sources_category 
  ON sources(category) WHERE active = true;

-- Index sur link pour déduplication rapide
CREATE INDEX IF NOT EXISTS idx_articles_link 
  ON articles(link);

-- ============================================
-- FONCTIONS AUTOMATIQUES
-- ============================================

-- Fonction: Cleanup automatique articles >24h
CREATE OR REPLACE FUNCTION cleanup_old_articles()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM articles 
  WHERE pub_date < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Trigger pour updated_at sur sources
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONNÉES INITIALES (Sources RSS)
-- ============================================

INSERT INTO sources (name, rss_url, category, color, free_tier, skip_translation, refresh_interval) VALUES
-- ISRAEL (gratuit: Ynet uniquement)
('Ynet', 'https://www.ynet.co.il/Integration/StoryRss2.xml', 'Israel', '#00A9E0', true, false, 30),
('Aroutz 7 HE', 'https://rss.mivzakim.net/rss/feed/61', 'Israel', '#E74C3C', false, false, 30),
('Arutz 7', 'https://rss.mivzakim.net/rss/feed/61', 'Israel', '#8B4513', false, false, 30),
('Arutz 14', 'https://rss.mivzakim.net/rss/feed/439', 'Israel', '#4A90E2', false, false, 30),
('Israel Hayom', 'https://rss.mivzakim.net/rss/feed/435', 'Israel', '#003399', false, false, 30),
('Walla', 'https://rss.walla.co.il/feed/1?type=main', 'Israel', '#FF6B6B', false, false, 30),

-- FRANCE (gratuit: France Info uniquement)
('France Info', 'https://www.francetvinfo.fr/titres.rss', 'France', '#0055A4', true, true, 30),
('Le Monde', 'https://www.lemonde.fr/rss/une.xml', 'France', '#0033A0', false, true, 30),
('BFM TV', 'https://www.bfmtv.com/rss/news-24-7/', 'France', '#FF6600', false, true, 30),

-- MONDE (payant)
('Reuters', 'https://rss.app/feeds/bwsfWXLgcmiLFkVO.xml', 'Monde', '#FF6600', false, false, 60),
('BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'Monde', '#BB1919', false, false, 60),
('Bloomberg', 'https://feeds.bloomberg.com/markets/news.rss', 'Monde', '#7E57C2', false, false, 60),
('FOXNews', 'https://moxie.foxnews.com/google-publisher/latest.xml', 'Monde', '#CC0000', false, false, 60),
('New York Times', 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', 'Monde', '#000000', false, false, 60),
('POLITICO', 'https://www.politico.com/rss/politics08.xml', 'Monde', '#E74C3C', false, false, 60),
('RT - Russie', 'https://www.rt.com/rss/', 'Monde', '#E85D75', false, false, 60),
('TASS (Agence de presse russe)', 'https://tass.com/rss/v2.xml', 'Monde', '#003B7A', false, false, 60),
('ANADOLU (Agence de presse turque)', 'https://www.aa.com.tr/en/rss/default?cat=world', 'Monde', '#D32F2F', false, false, 60)

ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PERMISSIONS (pour Supabase Auth future)
-- ============================================

-- Service role peut tout faire (backend)
-- Anon peut seulement lire (frontend)

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique pour sources actives
CREATE POLICY "Lecture publique sources actives"
  ON sources FOR SELECT
  USING (active = true);

-- Policy: Lecture articles (avec check subscription future)
CREATE POLICY "Lecture publique articles"
  ON articles FOR SELECT
  USING (true);

-- Policy: Écriture réservée au service_role (backend)
CREATE POLICY "Backend peut tout écrire articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Backend peut tout écrire sources"
  ON sources FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Backend peut tout écrire translations"
  ON translations_cache FOR ALL
  USING (auth.role() = 'service_role');
