-- Activer la traduction pour toutes les sources de la catégorie Monde
UPDATE sources 
SET skip_translation = false
WHERE category = 'Monde';

-- Vérifier le résultat
SELECT name, category, skip_translation 
FROM sources 
WHERE category = 'Monde'
ORDER BY name;
