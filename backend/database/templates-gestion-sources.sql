-- ============================================
-- TEMPLATES SQL - GESTION DES SOURCES
-- DAKA News Terminal
-- ============================================
-- À exécuter dans Supabase SQL Editor : https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- Remplace les valeurs en MAJUSCULES par tes valeurs réelles


-- ============================================
-- 1. AJOUTER UNE NOUVELLE SOURCE
-- ============================================

-- Template basique
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation)
VALUES (
  'NOM_SOURCE',              -- Ex: 'Le Figaro'
  'URL_RSS_COMPLETE',        -- Ex: 'https://lefigaro.fr/rss/figaro_actualites.xml'
  'CATEGORIE',               -- 'Israel', 'France' ou 'Monde'
  'COULEUR_HEX',            -- Ex: '#0066CC' (bleu), '#FF0000' (rouge), '#00AA00' (vert)
  false,                     -- true = gratuit, false = premium (€1.99/mois)
  true,                      -- true = actif, false = désactivé
  false                      -- true = pas de traduction (si déjà en français)
);

-- Exemple concret - Ajouter Le Figaro en premium
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation)
VALUES (
  'Le Figaro',
  'https://www.lefigaro.fr/rss/figaro_actualites.xml',
  'France',
  '#0066CC',
  false,
  true,
  true  -- Pas besoin de traduction (déjà en français)
);

-- Exemple - Ajouter Haaretz (Israel) en premium
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation)
VALUES (
  'Haaretz',
  'https://www.haaretz.com/cmlink/1.628752',
  'Israel',
  '#FF6B35',
  false,
  true,
  false  -- Besoin de traduction (hébreu)
);

-- Exemple - Ajouter NYT (Monde) en gratuit
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation)
VALUES (
  'New York Times',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'Monde',
  '#000000',
  true,   -- GRATUIT pour tous
  true,
  true    -- Anglais, pas de traduction
);


-- ============================================
-- 2. MODIFIER UNE SOURCE EXISTANTE
-- ============================================

-- Changer l'URL RSS (si le site a changé son flux)
UPDATE sources 
SET url = 'NOUVELLE_URL_RSS'
WHERE name = 'NOM_SOURCE';

-- Exemple concret
UPDATE sources 
SET url = 'https://www.ynet.co.il/Integration/StoryRss3.xml'
WHERE name = 'Ynet';

-- Changer le nom d'affichage
UPDATE sources 
SET name = 'NOUVEAU_NOM'
WHERE name = 'ANCIEN_NOM';

-- Exemple
UPDATE sources 
SET name = 'BBC World'
WHERE name = 'BBC News';

-- Changer la couleur
UPDATE sources 
SET color = '#NOUVELLE_COULEUR'
WHERE name = 'NOM_SOURCE';

-- Exemple
UPDATE sources 
SET color = '#FF0000'
WHERE name = 'CNN';

-- Changer de catégorie
UPDATE sources 
SET category = 'NOUVELLE_CATEGORIE'
WHERE name = 'NOM_SOURCE';

-- Exemple - Déplacer Al Jazeera de 'Monde' vers 'International'
UPDATE sources 
SET category = 'International'
WHERE name = 'Al Jazeera English';

-- Passer une source en gratuit (promotion)
UPDATE sources 
SET free_tier = true
WHERE name = 'NOM_SOURCE';

-- Exemple
UPDATE sources 
SET free_tier = true
WHERE name = 'Le Monde';

-- Repasser une source en premium
UPDATE sources 
SET free_tier = false
WHERE name = 'NOM_SOURCE';

-- Activer/désactiver la traduction
UPDATE sources 
SET skip_translation = true  -- true = pas de traduction
WHERE name = 'NOM_SOURCE';


-- ============================================
-- 3. ACTIVER / DÉSACTIVER UNE SOURCE
-- ============================================

-- Désactiver temporairement (garde les articles en BDD)
UPDATE sources 
SET active = false
WHERE name = 'NOM_SOURCE';

-- Exemple - Désactiver POLITICO (qui bloque avec 403)
UPDATE sources 
SET active = false
WHERE name = 'POLITICO';

-- Réactiver une source
UPDATE sources 
SET active = true
WHERE name = 'NOM_SOURCE';

-- Désactiver plusieurs sources d'un coup (par catégorie)
UPDATE sources 
SET active = false
WHERE category = 'CATEGORIE';

-- Exemple - Désactiver toutes les sources France
UPDATE sources 
SET active = false
WHERE category = 'France';

-- Désactiver toutes les sources premium (garder que gratuit)
UPDATE sources 
SET active = false
WHERE free_tier = false;


-- ============================================
-- 4. SUPPRIMER UNE SOURCE
-- ============================================

-- Supprimer définitivement (⚠️ supprime aussi tous les articles associés)
DELETE FROM sources 
WHERE name = 'NOM_SOURCE';

-- Exemple
DELETE FROM sources 
WHERE name = 'Source Obsolete';

-- Supprimer toutes les sources inactives
DELETE FROM sources 
WHERE active = false;

-- ⚠️ ATTENTION : Impossible d'annuler une suppression !
-- Recommandation : Utilise plutôt active = false pour désactiver sans supprimer


-- ============================================
-- 5. AJOUTER UNE NOUVELLE CATÉGORIE
-- ============================================

-- Les catégories ne sont pas une table séparée, c'est juste un texte
-- Pour ajouter une catégorie, ajoute simplement une source avec cette catégorie

-- Exemple - Créer la catégorie "Espagne"
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation)
VALUES (
  'El País',
  'https://elpais.com/rss/internacional.xml',
  'Espagne',  -- NOUVELLE CATÉGORIE
  '#FF6B35',
  false,
  true,
  true
);

-- Déplacer toutes les sources d'une catégorie vers une autre
UPDATE sources 
SET category = 'NOUVELLE_CATEGORIE'
WHERE category = 'ANCIENNE_CATEGORIE';

-- Exemple - Fusionner "Monde" et "International"
UPDATE sources 
SET category = 'International'
WHERE category = 'Monde';


-- ============================================
-- 6. REQUÊTES UTILES (CONSULTATION)
-- ============================================

-- Voir toutes les sources actives
SELECT name, category, url, free_tier, active 
FROM sources 
WHERE active = true
ORDER BY category, name;

-- Compter les sources par catégorie
SELECT category, COUNT(*) as nombre_sources
FROM sources
WHERE active = true
GROUP BY category
ORDER BY nombre_sources DESC;

-- Voir uniquement les sources gratuites
SELECT name, category, color 
FROM sources 
WHERE free_tier = true AND active = true
ORDER BY category;

-- Voir les sources qui nécessitent une traduction
SELECT name, category, url
FROM sources
WHERE skip_translation = false AND active = true;

-- Voir les sources inactives (problèmes potentiels)
SELECT name, category, url
FROM sources
WHERE active = false;

-- Trouver une source par URL (utile si doublon)
SELECT * FROM sources 
WHERE url LIKE '%ynet%';

-- Voir le nombre d'articles par source (dernières 24h)
SELECT 
  s.name,
  s.category,
  COUNT(a.id) as nb_articles
FROM sources s
LEFT JOIN articles a ON s.id = a.source_id
WHERE a.created_at > NOW() - INTERVAL '24 hours'
GROUP BY s.id, s.name, s.category
ORDER BY nb_articles DESC;


-- ============================================
-- 7. OPÉRATIONS EN MASSE
-- ============================================

-- Passer toutes les sources Israel en gratuit (promotion)
UPDATE sources 
SET free_tier = true
WHERE category = 'Israel';

-- Changer toutes les couleurs d'une catégorie
UPDATE sources 
SET color = '#COULEUR_HEX'
WHERE category = 'CATEGORIE';

-- Exemple - Toutes les sources France en bleu
UPDATE sources 
SET color = '#0055A4'
WHERE category = 'France';

-- Activer la traduction pour toutes les sources Israel
UPDATE sources 
SET skip_translation = false
WHERE category = 'Israel';

-- Désactiver toutes les sources pour maintenance
UPDATE sources 
SET active = false;

-- Réactiver toutes les sources après maintenance
UPDATE sources 
SET active = true;


-- ============================================
-- 8. TESTS ET DEBUG
-- ============================================

-- Tester une nouvelle URL RSS avant de l'ajouter
-- (À faire dans ton navigateur ou Postman)
-- Si ça retourne du XML → ça marche

-- Vérifier qu'une source n'existe pas déjà (éviter doublons)
SELECT * FROM sources 
WHERE name = 'NOM_SOURCE' OR url = 'URL_RSS';

-- Voir les articles d'une source spécifique
SELECT title, pub_date, created_at
FROM articles a
JOIN sources s ON a.source_id = s.id
WHERE s.name = 'NOM_SOURCE'
ORDER BY pub_date DESC
LIMIT 10;

-- Voir la dernière collecte d'une source
SELECT 
  s.name,
  MAX(a.created_at) as derniere_collecte,
  COUNT(a.id) as nb_articles_total
FROM sources s
LEFT JOIN articles a ON s.id = a.source_id
WHERE s.name = 'NOM_SOURCE'
GROUP BY s.name;


-- ============================================
-- 9. SCENARIOS DE PROBLÈMES COURANTS
-- ============================================

-- Une source ne collecte plus d'articles → Vérifier si active
SELECT name, active, url 
FROM sources 
WHERE name = 'NOM_SOURCE';

-- Si active = false
UPDATE sources SET active = true WHERE name = 'NOM_SOURCE';

-- Une source retourne 403/404 → Désactiver temporairement
UPDATE sources 
SET active = false
WHERE name = 'NOM_SOURCE';

-- L'URL RSS a changé (le site a migré) → Mettre à jour
UPDATE sources 
SET url = 'NOUVELLE_URL'
WHERE name = 'NOM_SOURCE';

-- Supprimer tous les articles d'une source (nettoyer les vieux articles)
DELETE FROM articles 
WHERE source_id = (SELECT id FROM sources WHERE name = 'NOM_SOURCE');

-- Réinitialiser une source (supprimer articles + désactiver)
DELETE FROM articles 
WHERE source_id = (SELECT id FROM sources WHERE name = 'NOM_SOURCE');

UPDATE sources 
SET active = false
WHERE name = 'NOM_SOURCE';


-- ============================================
-- 10. BACKUP / RESTORE
-- ============================================

-- Exporter toutes les sources (copie de sauvegarde)
-- Résultat à copier-coller dans un fichier .sql
SELECT 
  'INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation) VALUES (' ||
  '''' || name || ''', ' ||
  '''' || url || ''', ' ||
  '''' || category || ''', ' ||
  '''' || color || ''', ' ||
  free_tier || ', ' ||
  active || ', ' ||
  skip_translation || ');'
FROM sources
ORDER BY category, name;

-- Restaurer depuis un backup (exécuter le résultat de la requête ci-dessus)


-- ============================================
-- 11. EXEMPLES DE SOURCES RSS POPULAIRES
-- ============================================

-- ISRAEL (Hébreu)
/*
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation) VALUES
('Haaretz', 'https://www.haaretz.com/cmlink/1.628752', 'Israel', '#FF6B35', false, true, false),
('Calcalist', 'https://www.calcalist.co.il/GeneralRSS/0,16335,,00.xml', 'Israel', '#00B4D8', false, true, false),
('Globes', 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/Feeder', 'Israel', '#023047', false, true, false);
*/

-- FRANCE
/*
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation) VALUES
('Le Figaro', 'https://www.lefigaro.fr/rss/figaro_actualites.xml', 'France', '#0066CC', false, true, true),
('Libération', 'https://www.liberation.fr/arc/outboundfeeds/rss/', 'France', '#E63946', false, true, true),
('Les Echos', 'https://www.lesechos.fr/rss/monde.xml', 'France', '#212529', false, true, true),
('L\'Express', 'https://www.lexpress.fr/arc/outboundfeeds/rss/alaune.xml', 'France', '#D62828', false, true, true);
*/

-- MONDE (International)
/*
INSERT INTO sources (name, url, category, color, free_tier, active, skip_translation) VALUES
('The Guardian', 'https://www.theguardian.com/world/rss', 'Monde', '#052962', false, true, true),
('New York Times', 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', 'Monde', '#000000', false, true, true),
('Washington Post', 'https://feeds.washingtonpost.com/rss/world', 'Monde', '#14213D', false, true, true),
('Financial Times', 'https://www.ft.com/?format=rss', 'Monde', '#FFF1E6', false, true, true);
*/


-- ============================================
-- 12. NOTES IMPORTANTES
-- ============================================

/*
RÈGLES À RESPECTER :

1. URLS RSS valides uniquement
   - Toujours tester l'URL dans un navigateur avant d'ajouter
   - Doit retourner du XML (pas HTML, pas JSON)

2. Couleurs en format hexadécimal
   - Commence par #
   - 6 caractères (ex: #FF0000 pour rouge)

3. Catégories cohérentes
   - Utilise les catégories existantes: Israel, France, Monde
   - Si nouvelle catégorie: assure-toi que le frontend l'affiche

4. free_tier = true avec parcimonie
   - Seulement 2-3 sources gratuites max par catégorie
   - Stratégie freemium: gratuit attire, premium monétise

5. skip_translation
   - true pour français, anglais (si pas besoin de traduction)
   - false pour hébreu, arabe, etc.

6. Toujours faire un backup avant grosse modif
   - Copie le résultat de la requête d'export (point 10)
   - Garde-le dans un fichier texte

7. Test progressif
   - Ajoute une source → teste → si ça marche → ajoute les autres
   - Pas tout d'un coup

COMMANDES UTILES :

- Backend redémarrage: cd backend && npm run dev
- Voir les logs backend: tail -f backend/logs/app.log (si configuré)
- Tester une API: curl http://localhost:4000/api/sources | jq
*/


-- ============================================
-- FIN DES TEMPLATES
-- ============================================
-- Pour toute question: vérifie d'abord si la source est active = true
-- En cas de doute: désactive plutôt que supprimer (active = false)
-- Backup régulier recommandé: 1x par semaine minimum
