-- ============================================
-- MIGRATION: Ajout colonnes pour ordre d'affichage
-- Date: 17 février 2026
-- ============================================

-- Ajouter colonnes display_order et category_order si elles n'existent pas
DO $$ 
BEGIN
  -- display_order: ordre d'affichage dans une catégorie (0 = premier)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sources' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE sources ADD COLUMN display_order INTEGER DEFAULT 0;
    RAISE NOTICE 'Colonne display_order ajoutée';
  END IF;

  -- category_order: ordre d'affichage des catégories (Israel=1, France=2, Monde=3)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sources' AND column_name = 'category_order'
  ) THEN
    ALTER TABLE sources ADD COLUMN category_order INTEGER DEFAULT 0;
    RAISE NOTICE 'Colonne category_order ajoutée';
  END IF;
END $$;

-- Définir category_order selon la catégorie
UPDATE sources SET category_order = 1 WHERE category = 'Israel';
UPDATE sources SET category_order = 2 WHERE category = 'France';
UPDATE sources SET category_order = 3 WHERE category = 'Monde';

-- Définir display_order initial (ordre alphabétique par catégorie)
-- ISRAEL
UPDATE sources SET display_order = 1 WHERE name = 'Ynet';
UPDATE sources SET display_order = 2 WHERE name = 'Aroutz 7 HE';
UPDATE sources SET display_order = 3 WHERE name = 'Arutz 7';
UPDATE sources SET display_order = 4 WHERE name = 'Arutz 14';
UPDATE sources SET display_order = 5 WHERE name = 'Israel Hayom';
UPDATE sources SET display_order = 6 WHERE name = 'Walla';

-- FRANCE
UPDATE sources SET display_order = 1 WHERE name = 'France Info';
UPDATE sources SET display_order = 2 WHERE name = 'Le Monde';
UPDATE sources SET display_order = 3 WHERE name = 'BFM TV';

-- MONDE
UPDATE sources SET display_order = 1 WHERE name = 'Reuters';
UPDATE sources SET display_order = 2 WHERE name = 'BBC World';
UPDATE sources SET display_order = 3 WHERE name = 'Bloomberg';
UPDATE sources SET display_order = 4 WHERE name = 'FOXNews';
UPDATE sources SET display_order = 5 WHERE name = 'New York Times';
UPDATE sources SET display_order = 6 WHERE name = 'POLITICO';
UPDATE sources SET display_order = 7 WHERE name = 'RT - Russie';
UPDATE sources SET display_order = 8 WHERE name = 'TASS (Agence de presse russe)';
UPDATE sources SET display_order = 9 WHERE name = 'ANADOLU (Agence de presse turque)';

-- Créer index pour performances
CREATE INDEX IF NOT EXISTS idx_sources_order 
  ON sources(category_order, display_order);

-- ============================================
-- RÉSUMÉ
-- ============================================

SELECT 
  category,
  name,
  display_order,
  category_order,
  active,
  free_tier
FROM sources
ORDER BY category_order, display_order;
