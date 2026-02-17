# 📖 GUIDE SIMPLE : Gérer les Sources RSS depuis Supabase

**Pour : Gabriel (non-développeur)**  
**Date : 17 février 2026**  
**Objectif : Modifier, ajouter, supprimer ou réorganiser les sources d'actualités sur DAKA News**

---

## 🔑 ACCÈS RAPIDE

### 1️⃣ Se connecter à Supabase

**Lien direct** : https://supabase.com/dashboard/sign-in

📧 **Email** : Celui que tu as utilisé pour créer le compte Supabase  
🔐 **Mot de passe** : Ton mot de passe Supabase

### 2️⃣ Accéder à ton projet

Une fois connecté, clique sur le projet **"DAKA News"** (ou le nom que tu lui as donné).

### 3️⃣ Ouvrir l'éditeur SQL

Dans le menu de gauche, clique sur :
```
🗂️ SQL Editor
```

Tu arrives sur une page blanche où tu peux écrire du code SQL.

---

## 📋 COMPRENDRE LA STRUCTURE

Chaque source a ces informations :

| Colonne | Explication | Exemple |
|---------|-------------|---------|
| **name** | Nom affiché dans l'app | `"Ynet"` |
| **rss_url** | Adresse du flux RSS | `"https://www.ynet.co.il/...xml"` |
| **category** | Catégorie (Israel, France, Monde) | `"Israel"` |
| **display_order** | Ordre d'affichage (1 = premier) | `1` |
| **active** | Affichée ou masquée | `true` (oui) / `false` (non) |
| **free_tier** | Gratuite ou payante | `true` (gratuit) / `false` (payant) |

---

## ✏️ OPÉRATIONS SIMPLES

### ✅ 1. Mettre une source en premier dans sa catégorie

**Exemple** : Tu veux mettre **"Reuters"** en premier dans **Monde**

**📋 Copie-colle ce code dans SQL Editor** :

```sql
UPDATE sources SET display_order = 1 WHERE name = 'Reuters · AP | U.S. News';
```

**Puis clique sur le bouton ▶️ RUN en bas à droite**

✅ **Résultat** : Reuters apparaît maintenant en premier dans Monde !

---

### ✅ 2. Réorganiser plusieurs sources en même temps

**Exemple** : Tu veux cet ordre dans **Monde** :
1. Reuters (gratuit)
2. BBC News
3. FOXNews
4. RT - Russie
5. ANADOLU
6. TASS

**📋 Copie-colle ce code** :

```sql
UPDATE sources SET display_order = 1 WHERE name = 'Reuters · AP | U.S. News';
UPDATE sources SET display_order = 2 WHERE name = 'BBC News';
UPDATE sources SET display_order = 3 WHERE name = 'FOXNews';
UPDATE sources SET display_order = 4 WHERE name = 'RT - Russie';
UPDATE sources SET display_order = 5 WHERE name = 'ANADOLU (Agence turque)';
UPDATE sources SET display_order = 6 WHERE name = 'TASS (Agence russe)';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : L'ordre est changé immédiatement !

---

### ✅ 3. Masquer temporairement une source

**Exemple** : Tu veux retirer **"France Bleu"** sans la supprimer

**📋 Copie-colle** :

```sql
UPDATE sources SET active = false WHERE name = 'France Bleu';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : France Bleu n'apparaît plus dans l'app (mais reste en base de données)

---

### ✅ 4. Réafficher une source masquée

**Exemple** : Tu veux réafficher **"France Bleu"**

**📋 Copie-colle** :

```sql
UPDATE sources SET active = true WHERE name = 'France Bleu';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : France Bleu réapparaît dans l'app !

---

### ✅ 5. Ajouter une nouvelle source

**Exemple** : Tu veux ajouter **"Times of Israel"** dans la catégorie **Israel**

**📋 Copie-colle** :

```sql
INSERT INTO sources (
  name, 
  rss_url, 
  category, 
  color, 
  active, 
  free_tier, 
  display_order,
  category_order
) VALUES (
  'Times of Israel',                                  -- Nom affiché
  'https://www.timesofisrael.com/feed/',             -- URL du flux RSS
  'Israel',                                           -- Catégorie
  '#3B82F6',                                          -- Couleur (bleu)
  true,                                               -- Affichée (true) ou masquée (false)
  false,                                              -- Gratuite (true) ou payante (false)
  9,                                                  -- Position (9 = après les 8 sources actuelles)
  1                                                   -- 1=Israel, 2=France, 3=Monde
);
```

**Clique sur ▶️ RUN**

✅ **Résultat** : Times of Israel apparaît dans l'app catégorie Israel !

**⚠️ Important** : Vérifie que l'URL RSS fonctionne en la testant dans ton navigateur avant !

---

### ✅ 6. Changer le nom d'une source

**Exemple** : Tu veux renommer **"Ynet"** en **"Yedioth Ahronot (Ynet)"**

**📋 Copie-colle** :

```sql
UPDATE sources SET name = 'Yedioth Ahronot (Ynet)' WHERE name = 'Ynet';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : Le nouveau nom s'affiche dans l'app !

---

### ✅ 7. Changer l'URL RSS d'une source

**Exemple** : L'URL de **"Ynet"** a changé

**📋 Copie-colle** :

```sql
UPDATE sources SET rss_url = 'https://NOUVELLE-URL.com/rss.xml' WHERE name = 'Ynet';
```

**Remplace `https://NOUVELLE-URL.com/rss.xml` par la vraie URL**

**Clique sur ▶️ RUN**

✅ **Résultat** : L'app récupère maintenant les articles depuis la nouvelle URL !

---

### ✅ 8. Supprimer définitivement une source

**⚠️ ATTENTION** : Cette action **SUPPRIME AUSSI tous les articles** de cette source !

**📋 Copie-colle** :

```sql
DELETE FROM sources WHERE name = 'France Bleu';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : France Bleu disparaît de l'app et de la base de données.

**💡 Alternative recommandée** : Au lieu de supprimer, préfère **masquer** avec `active = false` (voir point 3).

---

### ✅ 9. Rendre une source gratuite (au lieu de payante)

**Exemple** : Tu veux rendre **"Le Monde"** gratuit

**📋 Copie-colle** :

```sql
UPDATE sources SET free_tier = true WHERE name = 'Le Monde';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : Tous les utilisateurs (même non-premium) voient maintenant Le Monde !

---

### ✅ 10. Rendre une source payante (premium uniquement)

**Exemple** : Tu veux rendre **"Reuters"** payant

**📋 Copie-colle** :

```sql
UPDATE sources SET free_tier = false WHERE name = 'Reuters · AP | U.S. News';
```

**Clique sur ▶️ RUN**

✅ **Résultat** : Seuls les utilisateurs premium voient maintenant Reuters !

---

## 🔍 VÉRIFICATIONS UTILES

### ✅ Voir toutes les sources actives (triées par ordre)

**📋 Copie-colle** :

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

**Clique sur ▶️ RUN**

✅ **Résultat** : Tu vois la liste complète dans l'ordre d'affichage !

---

### ✅ Voir quelles sources sont gratuites

**📋 Copie-colle** :

```sql
SELECT name, category, free_tier 
FROM sources 
WHERE active = true AND free_tier = true
ORDER BY category_order, display_order;
```

**Clique sur ▶️ RUN**

✅ **Résultat** : Liste des sources gratuites !

---

### ✅ Voir quelles sources n'ont pas d'articles (URL cassée ?)

**📋 Copie-colle** :

```sql
SELECT 
  s.name,
  s.category,
  s.rss_url,
  COUNT(a.id) as nombre_articles
FROM sources s
LEFT JOIN articles a ON s.id = a.source_id
WHERE s.active = true
GROUP BY s.id, s.name, s.category, s.rss_url
ORDER BY nombre_articles ASC;
```

**Clique sur ▶️ RUN**

✅ **Résultat** : Si `nombre_articles = 0`, l'URL RSS est probablement cassée !

---

## 📊 ORDRE ACTUEL DES SOURCES (17 février 2026)

### 🇮🇱 **Israel** (8 sources)
1. Ynet (gratuit) ✅
2. Arutz 7
3. Arutz 14
4. Behadrei Haredim
5. Israel Hayom
6. JDN Hadachot
7. Walla
8. Maariv

### 🇫🇷 **France** (6 sources)
1. France Info (gratuit) ✅
2. Le Monde
3. BFM TV
4. CNews
5. Dépêches AFP - Mediapart
6. France Bleu

### 🌍 **Monde** (6 sources)
1. Reuters · AP | U.S. News (gratuit) ✅
2. BBC News
3. FOXNews
4. RT - Russie
5. ANADOLU (Agence turque)
6. TASS (Agence russe)

---

## 🎨 COULEURS DISPONIBLES (pour nouvelles sources)

Copie-colle un de ces codes dans le champ `color` :

| Couleur | Code |
|---------|------|
| Rouge | `#EF4444` |
| Bleu | `#3B82F6` |
| Vert | `#10B981` |
| Jaune | `#F59E0B` |
| Violet | `#8B5CF6` |
| Orange | `#F97316` |
| Rose | `#EC4899` |
| Cyan | `#06B6D4` |

---

## ⚡ QUAND LES MODIFICATIONS S'APPLIQUENT ?

- **Site web (dakanews.com)** : Dans les **3 minutes** maximum
- **App mobile iOS** : Au prochain **lancement** de l'app ou **pull-to-refresh**
- **Backend (collecte des articles)** : Continue automatiquement toutes les 3 minutes

**Tu n'as RIEN à faire** après avoir exécuté le SQL ! ✅

---

## ❓ QUESTIONS FRÉQUENTES

### 1. J'ai fait une erreur, comment annuler ?

**Annuler un changement de nom** :
```sql
UPDATE sources SET name = 'Ancien Nom' WHERE name = 'Nouveau Nom';
```

**Réafficher une source masquée** :
```sql
UPDATE sources SET active = true WHERE name = 'Nom de la source';
```

**Restaurer une source supprimée** :
→ Pas possible, il faut la recréer avec `INSERT INTO sources...`

---

### 2. Comment savoir si une URL RSS fonctionne ?

**Méthode simple** :
1. Copie l'URL RSS
2. Colle-la dans ton navigateur (Safari, Chrome...)
3. Si tu vois du XML ou des articles → ✅ Ça marche !
4. Si erreur 404 ou page blanche → ❌ L'URL est cassée

---

### 3. Combien de temps avant que l'app affiche les nouveaux articles ?

Le backend collecte les articles **toutes les 3 minutes**. Donc maximum **3 minutes** après avoir ajouté une source.

---

### 4. Je ne vois pas ma nouvelle source dans l'app ?

**Checklist** :
- ✅ As-tu bien mis `active = true` ?
- ✅ As-tu mis le bon `category_order` (1=Israel, 2=France, 3=Monde) ?
- ✅ L'URL RSS fonctionne-t-elle dans ton navigateur ?
- ✅ As-tu attendu 3 minutes pour la collecte ?
- ✅ As-tu rafraîchi l'app (pull-to-refresh) ?

---

### 5. Puis-je changer l'ordre des catégories (Israel, France, Monde) ?

**Oui**, mais déconseillé car c'est l'ordre logique pour ton audience.

Si vraiment tu veux (exemple : Monde en premier) :
```sql
UPDATE sources SET category_order = 1 WHERE category = 'Monde';
UPDATE sources SET category_order = 2 WHERE category = 'Israel';
UPDATE sources SET category_order = 3 WHERE category = 'France';
```

---

## 🆘 EN CAS DE PROBLÈME

### Le SQL ne marche pas (erreur)

**Erreur courante** : Tu as oublié les guillemets autour du nom

❌ **Mauvais** :
```sql
UPDATE sources SET active = false WHERE name = Ynet;
```

✅ **Bon** :
```sql
UPDATE sources SET active = false WHERE name = 'Ynet';
```

---

### Je ne sais plus quel est le nom exact d'une source

**Copie-colle pour voir tous les noms** :
```sql
SELECT name FROM sources ORDER BY name;
```

Puis copie-colle le nom exact pour ton UPDATE.

---

### J'ai tout cassé, comment restaurer ?

**Option 1 : Désactiver temporairement**
```sql
UPDATE sources SET active = false WHERE id > 0;
```
(Masque toutes les sources, le temps de réparer)

**Option 2 : Contacter le dev**
→ Envoie un message avec ce que tu as fait, on restaurera.

---

## 📞 CONTACT

**Si tu as une question ou un problème** :
→ Envoie un message via ce chat ou crée un ticket GitHub.

**Temps de réponse** : 24h max

---

## ✅ RÉSUMÉ RAPIDE

| Action | Code SQL |
|--------|----------|
| **Mettre en premier** | `UPDATE sources SET display_order = 1 WHERE name = 'Nom';` |
| **Masquer** | `UPDATE sources SET active = false WHERE name = 'Nom';` |
| **Afficher** | `UPDATE sources SET active = true WHERE name = 'Nom';` |
| **Ajouter** | `INSERT INTO sources (...) VALUES (...);` (voir exemple complet) |
| **Supprimer** | `DELETE FROM sources WHERE name = 'Nom';` ⚠️ Définitif ! |
| **Renommer** | `UPDATE sources SET name = 'Nouveau Nom' WHERE name = 'Ancien';` |
| **Changer URL** | `UPDATE sources SET rss_url = 'URL' WHERE name = 'Nom';` |
| **Rendre gratuit** | `UPDATE sources SET free_tier = true WHERE name = 'Nom';` |
| **Rendre payant** | `UPDATE sources SET free_tier = false WHERE name = 'Nom';` |

---

**🎉 Félicitations, tu sais maintenant gérer les sources comme un pro !**

**Dernière mise à jour** : 17 février 2026
