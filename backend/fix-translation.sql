-- ✅ SCRIPT DE DIAGNOSTIC ET CORRECTION TRADUCTION

-- 1️⃣ VÉRIFIER SI LA COLONNE source_lang EXISTE
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sources' 
AND column_name = 'source_lang';

-- Si la colonne N'EXISTE PAS, la créer :
-- ALTER TABLE sources ADD COLUMN IF NOT EXISTS source_lang TEXT DEFAULT 'fr';

-- 2️⃣ VÉRIFIER L'ÉTAT ACTUEL DES SOURCES
SELECT 
  id, 
  name, 
  category, 
  skip_translation,
  source_lang,
  active
FROM sources 
WHERE active = true
ORDER BY category, name;

-- 3️⃣ CORRIGER LES VALEURS source_lang

-- Israël → hébreu
UPDATE sources 
SET source_lang = 'he' 
WHERE category = 'Israel' 
AND (source_lang IS NULL OR source_lang = 'fr');

-- Monde → anglais
UPDATE sources 
SET source_lang = 'en' 
WHERE category = 'Monde' 
AND (source_lang IS NULL OR source_lang = 'fr');

-- France → français (pas de traduction)
UPDATE sources 
SET source_lang = 'fr' 
WHERE category = 'France';

-- 4️⃣ S'ASSURER QUE skip_translation EST CORRECT

-- Israël et Monde : skip_translation = false (traduire)
UPDATE sources 
SET skip_translation = false 
WHERE category IN ('Israel', 'Monde');

-- France : skip_translation = true (ne pas traduire)
UPDATE sources 
SET skip_translation = true 
WHERE category = 'France';

-- 5️⃣ VÉRIFIER LE RÉSULTAT FINAL
SELECT 
  name, 
  category, 
  source_lang,
  skip_translation,
  CASE 
    WHEN skip_translation = false AND source_lang != 'fr' THEN '✅ VA TRADUIRE'
    WHEN skip_translation = true OR source_lang = 'fr' THEN '⏭️ PAS DE TRADUCTION'
    ELSE '⚠️ CONFIG INVALIDE'
  END as status
FROM sources 
WHERE active = true
ORDER BY category, name;
