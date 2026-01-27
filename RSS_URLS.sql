-- ========================================
-- URLs RSS POUR SUPABASE
-- À COPIER DANS SUPABASE SQL EDITOR
-- ========================================

-- ISRAEL (5 sources)
UPDATE sources SET rss_url = 'https://rss.mivzakim.net/rss/feed/1' WHERE name = 'Ynet';
UPDATE sources SET rss_url = 'https://rss.mivzakim.net/rss/feed/231' WHERE name = 'Walla';
UPDATE sources SET rss_url = 'https://rss.mivzakim.net/rss/feed/61' WHERE name = 'Arutz 7';
UPDATE sources SET rss_url = 'https://rss.mivzakim.net/rss/feed/435' WHERE name = 'Israel Hayom';
UPDATE sources SET rss_url = 'https://rss.mivzakim.net/rss/feed/439' WHERE name = 'Arutz 14';

-- FRANCE (3 sources)
UPDATE sources SET rss_url = 'https://www.francetvinfo.fr/titres.rss' WHERE name = 'France Info';
UPDATE sources SET rss_url = 'https://www.lemonde.fr/rss/une.xml' WHERE name = 'Le Monde';
UPDATE sources SET rss_url = 'https://www.bfmtv.com/rss/info/flux-rss/flux-toutes-les-actualites/' WHERE name = 'BFM TV';

-- MONDE (8 sources)
UPDATE sources SET rss_url = 'https://www.aa.com.tr/en/rss/default?cat=live' WHERE name = 'ANADOLU (Agence de presse turque)';
UPDATE sources SET rss_url = 'https://rss.app/feeds/bwsfWXLgcmiLFkVO.xml' WHERE name = 'Reuters';
UPDATE sources SET rss_url = 'https://feeds.bbci.co.uk/news/world/rss.xml' WHERE name = 'BBC World';
UPDATE sources SET rss_url = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' WHERE name = 'New York Times';
UPDATE sources SET rss_url = 'https://www.rt.com/rss/' WHERE name = 'RT - Russie';
UPDATE sources SET rss_url = 'https://tass.com/rss/v2.xml' WHERE name = 'TASS (Agence de presse russe)';
UPDATE sources SET rss_url = 'https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en' WHERE name = 'Bloomberg';
UPDATE sources SET rss_url = 'http://feeds.foxnews.com/foxnews/politics' WHERE name = 'FOXNews';

-- Vérification
SELECT name, rss_url, category FROM sources ORDER BY category, name;
