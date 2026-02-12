-- ═══════════════════════════════════════════════════════════════════════
-- AJOUTER FRANCE BLEU dans la catégorie France
-- ═══════════════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor
-- France Bleu sera placé entre "Dépêches AFP - Mediapart" et "Le Monde"

-- 1. Décaler "Le Monde" et toutes les sources suivantes de +1
UPDATE rss_sources
SET display_order = display_order + 1
WHERE country = 'France'
  AND display_order >= (
    SELECT display_order FROM rss_sources WHERE name = 'Le Monde' AND country = 'France'
  );

-- 2. Insérer France Bleu
INSERT INTO rss_sources (
  name,
  url,
  country,
  color,
  free_tier,
  requires_translation,
  display_order,
  is_active
)
VALUES (
  'France Bleu',
  'https://rss.app/feeds/bVTLMM9t2XjDLJaw.xml',
  'France',
  '#0055A4',  -- Bleu France
  false,      -- Source Premium
  false,      -- Pas besoin de traduction
  (SELECT display_order FROM rss_sources WHERE name = 'Le Monde' AND country = 'France') - 1,
  true
);

-- 3. Vérification : Afficher l'ordre des sources France
SELECT 
  display_order,
  name,
  country,
  free_tier,
  requires_translation,
  is_active
FROM rss_sources
WHERE country = 'France'
ORDER BY display_order;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ Résultat attendu :
--   1. BFM TV
--   2. France Info
--   3. Dépêches AFP - Mediapart
--   4. France Bleu  ← NOUVEAU
--   5. Le Monde
-- ═══════════════════════════════════════════════════════════════════════
