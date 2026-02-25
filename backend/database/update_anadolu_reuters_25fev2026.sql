-- ============================================
-- MODIFICATION FLUX GRATUITS - 25 FÉV 2026
-- ============================================

-- 1️⃣ ANADOLU (Agence turque) : Devient GRATUIT + Position 1 dans Monde
UPDATE sources 
SET 
  free_tier = true,
  display_order = 1
WHERE name = 'ANADOLU (Agence turque)';

-- 2️⃣ Reuters · AP | U.S. News : Devient PREMIUM + Position alphabétique (après Anadolu)
UPDATE sources 
SET 
  free_tier = false,
  display_order = 21
WHERE name = 'Reuters · AP | U.S. News';

-- ✅ Vérification
SELECT name, category, free_tier, display_order 
FROM sources 
WHERE category = 'Monde'
ORDER BY display_order ASC;
