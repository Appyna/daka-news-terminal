-- ═══════════════════════════════════════════════════════════════════════
-- AJOUTER FRANCE BLEU dans la catégorie France
-- ═══════════════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor
-- France Bleu sera placé entre les sources existantes

-- Vérifier d'abord les sources France existantes
SELECT id, name, category, free_tier, skip_translation
FROM sources
WHERE category = 'France'
ORDER BY id;

-- Insérer France Bleu
INSERT INTO sources (
  name,
  rss_url,
  category,
  color,
  free_tier,
  skip_translation,
  active
)
VALUES (
  'France Bleu',
  'https://rss.app/feeds/bVTLMM9t2XjDLJaw.xml',
  'France',
  '#0055A4',  -- Bleu France
  false,      -- Source Premium
  true,       -- Pas besoin de traduction (déjà en français)
  true
);

-- Vérification finale : Afficher toutes les sources France
SELECT 
  id,
  name,
  category,
  free_tier,
  skip_translation,
  active
FROM sources
WHERE category = 'France'
ORDER BY id;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ France Bleu ajouté avec succès
-- ═══════════════════════════════════════════════════════════════════════
