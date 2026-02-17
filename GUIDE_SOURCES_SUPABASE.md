# 📚 GUIDE : Gestion des Sources RSS (Supabase)

## 🎯 Objectif

Ce guide explique comment **ajouter, modifier, supprimer ou réorganiser** les sources RSS de DAKA News **sans toucher au code** et **sans redéploiement**.

Toutes les modifications dans Supabase sont **immédiatement prises en compte** sur le site web et les applications mobiles (au prochain rafraîchissement).

---

## 🔗 Accès Supabase

**URL SQL Editor** : https://supabase.com/dashboard/project/wzqhrothppyktowwllkr/sql

**Table des sources** : https://supabase.com/dashboard/project/wzqhrothppyktowwllkr/editor/28854

---

## 📋 Structure de la table `sources`

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| `id` | INTEGER | ID auto-généré (ne pas modifier) | `1` |
| `name` | TEXT | Nom affiché dans l'app/site | `"Ynet"` |
| `rss_url` | TEXT | URL du flux RSS | `"https://www.ynet.co.il/Integration/StoryRss2.xml"` |
| `category` | TEXT | Catégorie (Israel, France, Monde) | `"Israel"` |
| `color` | TEXT | Couleur d'affichage (hex) | `"#FF6B6B"` |
| `active` | BOOLEAN | Afficher ou masquer la source | `true` / `false` |
| `free_tier` | BOOLEAN | Gratuit ou premium | `true` (gratuit) / `false` (payant) |
| `refresh_interval` | INTEGER | Intervalle de collecte (secondes) | `30` (30 secondes) |
| `skip_translation` | BOOLEAN | Traduire ou non (false=traduire) | `false` (traduire) / `true` (français) |
| `display_order` | INTEGER | Ordre d'affichage dans la catégorie | `1`, `2`, `3`... |
| `category_order` | INTEGER | Ordre de la catégorie (Israel=1, France=2, Monde=3) | `1` / `2` / `3` |
| `created_at` | TIMESTAMPTZ | Date de création | `2025-02-17 10:30:00` |
| `updated_at` | TIMESTAMPTZ | Date de modification | `2025-02-17 12:45:00` |

---

## 🛠️ OPÉRATIONS COURANTES

### ✅ 1. Activer/Désactiver une source

**Dans Table Editor** :
1. Va sur https://supabase.com/dashboard/project/wzqhrothppyktowwllkr/editor/28854
2. Clique sur la ligne de la source
3. Change `active` : `true` (afficher) ou `false` (masquer)
4. Clique "Save"

**Ou en SQL** :
```sql
-- Désactiver "France Bleu"
UPDATE sources SET active = false WHERE name = 'France Bleu';

-- Réactiver "France Bleu"
UPDATE sources SET active = true WHERE name = 'France Bleu';
```

---

### ✅ 2. Modifier l'ordre d'affichage d'une source

**Exemple** : Mettre "BFM TV" en premier dans la catégorie France

**En SQL** :
```sql
-- BFM TV passe en position 1
UPDATE sources SET display_order = 1 WHERE name = 'BFM TV';

-- Décaler les autres sources (France Info devient 2, Le Monde devient 3, etc.)
UPDATE sources SET display_order = 2 WHERE name = 'France Info';
UPDATE sources SET display_order = 3 WHERE name = 'Le Monde';
```

**Astuce** : Utilise des intervalles de 10 pour faciliter les insertions :
```sql
UPDATE sources SET display_order = 10 WHERE name = 'Ynet';
UPDATE sources SET display_order = 20 WHERE name = 'Arutz 7';
UPDATE sources SET display_order = 30 WHERE name = 'Arutz 14';
-- Comme ça, tu peux insérer display_order = 15 entre Ynet et Arutz 7
```

---

### ✅ 3. Ajouter une nouvelle source

**En SQL** :
```sql
INSERT INTO sources (
  name, 
  rss_url, 
  category, 
  color, 
  active, 
  free_tier, 
  refresh_interval, 
  skip_translation,
  display_order,
  category_order
) VALUES (
  'Times of Israel',                                      -- Nom
  'https://www.timesofisrael.com/feed/',                 -- URL RSS
  'Israel',                                               -- Catégorie (Israel/France/Monde)
  '#3B82F6',                                              -- Couleur (bleu)
  true,                                                   -- Actif (true/false)
  false,                                                  -- Payant (false=payant, true=gratuit)
  60,                                                     -- Refresh toutes les 60 secondes
  false,                                                  -- Traduire (false=oui)
  10,                                                     -- Ordre d'affichage (10 = après Ynet)
  1                                                       -- Israel=1, France=2, Monde=3
);
```

**Note** : Vérifie que l'URL RSS est valide en la testant dans un navigateur.

---

### ✅ 4. Modifier l'URL d'une source

**Exemple** : Ynet change d'URL RSS

```sql
UPDATE sources 
SET rss_url = 'https://www.ynet.co.il/Integration/NewRss.xml' 
WHERE name = 'Ynet';
```

---

### ✅ 5. Renommer une source

```sql
UPDATE sources 
SET name = 'Yedioth Ahronoth (Ynet)' 
WHERE name = 'Ynet';
```

⚠️ **Attention** : Le nom est utilisé dans les articles. Si tu renommes, les **anciens articles garderont l'ancien nom** (OK, ils disparaîtront après 24h).

---

### ✅ 6. Supprimer une source

⚠️ **ATTENTION** : Supprime aussi **tous les articles** de cette source (CASCADE).

```sql
-- Désactive d'abord (pour tester)
UPDATE sources SET active = false WHERE name = 'France Bleu';

-- Si OK, supprime définitivement
DELETE FROM sources WHERE name = 'France Bleu';
```

**Alternative non-destructive** : Garder la source mais la désactiver (`active = false`).

---

### ✅ 7. Changer la catégorie d'une source

**Exemple** : Déplacer "Reuters" de Monde → France

```sql
UPDATE sources 
SET 
  category = 'France',
  category_order = 2,
  display_order = 99  -- Mettre à la fin de France
WHERE name = 'Reuters · AP | U.S. News';
```

---

### ✅ 8. Modifier la couleur d'une source

**Couleurs disponibles** (exemples) :
- Rouge : `#EF4444`, `#DC2626`, `#B91C1C`
- Bleu : `#3B82F6`, `#2563EB`, `#1D4ED8`
- Vert : `#10B981`, `#059669`, `#047857`
- Jaune : `#F59E0B`, `#D97706`, `#B45309`
- Violet : `#8B5CF6`, `#7C3AED`, `#6D28D9`

```sql
UPDATE sources SET color = '#EF4444' WHERE name = 'FOXNews';
```

---

### ✅ 9. Lister toutes les sources actives (triées)

```sql
SELECT 
  category,
  name,
  display_order,
  active,
  free_tier
FROM sources
WHERE active = true
ORDER BY category_order, display_order;
```

---

### ✅ 10. Vérifier quelles sources n'ont pas d'articles

```sql
SELECT 
  s.name,
  s.category,
  s.rss_url,
  COUNT(a.id) as article_count
FROM sources s
LEFT JOIN articles a ON s.id = a.source_id
WHERE s.active = true
GROUP BY s.id
ORDER BY article_count ASC;
```

Si `article_count = 0`, l'URL RSS est probablement cassée.

---

## 🎨 EXEMPLES DE RÉORGANISATION

### Exemple 1 : Réorganiser Israël

**Avant** : Ynet → Arutz 7 → Arutz 14

**Après** : Arutz 14 → Ynet → Arutz 7

```sql
UPDATE sources SET display_order = 10 WHERE name = 'Arutz 14';
UPDATE sources SET display_order = 20 WHERE name = 'Ynet';
UPDATE sources SET display_order = 30 WHERE name = 'Arutz 7';
```

---

### Exemple 2 : Masquer toutes les sources payantes (pour tester)

```sql
UPDATE sources SET active = false WHERE free_tier = false;
```

Pour réactiver :
```sql
UPDATE sources SET active = true WHERE free_tier = false;
```

---

## 🔥 BONNES PRATIQUES

1. **Teste d'abord avec `active = false`** avant de supprimer
2. **Utilise des intervalles de 10** pour `display_order` (facilite les insertions)
3. **Vérifie l'URL RSS** dans un navigateur avant d'ajouter une source
4. **Ne change pas `category_order`** sauf si tu veux réorganiser Israel/France/Monde
5. **Sauvegarde avant grosse modif** :
   ```sql
   -- Exporte la table
   SELECT * FROM sources ORDER BY id;
   ```

---

## 📊 ORDRE ACTUEL DES SOURCES (17 fév 2026)

### 🇮🇱 **Israel** (category_order = 1)
1. Ynet (display_order=1)
2. Arutz 7 (display_order=3)
3. Arutz 14 (display_order=4)
4. Behadrei Haredim (display_order=4)
5. Israel Hayom (display_order=5)
6. JDN Hadachot (display_order=6)
7. Walla (display_order=6)
8. Maariv (display_order=7)

### 🇫🇷 **France** (category_order = 2)
1. France Info (display_order=1)
2. Le Monde (display_order=2)
3. BFM TV (display_order=3)
4. CNews (display_order=13)
5. Dépêches AFP - Mediapart (display_order=14)
6. France Bleu (display_order=999)

### 🌍 **Monde** (category_order = 3)
1. FOXNews (display_order=4)
2. RT - Russie (display_order=7)
3. Reuters · AP | U.S. News (display_order=21)
4. ANADOLU (Agence turque) (display_order=22)
5. BBC News (display_order=23)
6. TASS (Agence russe) (display_order=25)

---

## ⚡ EFFET DES MODIFICATIONS

- **Site web** : Rafraîchissement immédiat (dès que le cache expire, ~3 min max)
- **App mobile iOS/Android** : Au prochain lancement ou pull-to-refresh
- **Backend cron** : Continue de collecter les sources actives (toutes les 3 min)

**Aucun redéploiement nécessaire !** 🎉

---

## 🆘 AIDE

**Questions / bugs** : Contact développeur via ce chat ou GitHub Issues.

**Tester une source RSS** : https://www.rssboard.org/rss-validator/
