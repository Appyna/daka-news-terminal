# 📡 URLs RSS - DAKA NEWS TERMINAL

## ✅ TOUTES LES URLs VALIDÉES
**CES URLs ONT ÉTÉ VALIDÉES PAR L'UTILISATEUR**
⚠️ NE JAMAIS MODIFIER CES URLs SANS ACCORD EXPLICITE DE L'UTILISATEUR.

---

## 🇮🇱 ISRAEL (5 sources)

| Source | URL RSS | Status |
|--------|---------|--------|
| **Ynet** | `https://rss.mivzakim.net/rss/feed/1` | ✅ **VALIDÉE** |
| **Walla** | `https://rss.mivzakim.net/rss/feed/231` | ✅ **VALIDÉE** |
| **Arutz 7** | `https://rss.mivzakim.net/rss/feed/61` | ✅ **VALIDÉE** |
| **Israel Hayom** | `https://rss.mivzakim.net/rss/feed/435` | ✅ **VALIDÉE** |
| **Arutz 14** | `https://rss.mivzakim.net/rss/feed/439` | ✅ **VALIDÉE** |

---

## 🇫🇷 FRANCE (3 sources)

| Source | URL RSS | Status |
|--------|---------|--------|
| **France Info** | `https://www.francetvinfo.fr/titres.rss` | ✅ **VALIDÉE** |
| **Le Monde** | `https://www.lemonde.fr/rss/une.xml` | ✅ **VALIDÉE** |
| **BFM TV** | `https://www.bfmtv.com/rss/info/flux-rss/flux-toutes-les-actualites/` | ✅ **VALIDÉE** |

---

## 🌍 MONDE (8 sources)

| Source | URL RSS | Status |
|--------|---------|--------|
| **ANADOLU (Agence turque)** | `https://www.aa.com.tr/en/rss/default?cat=live` | ✅ **VALIDÉE** |
| **Reuters** | `https://rss.app/feeds/bwsfWXLgcmiLFkVO.xml` | ✅ **VALIDÉE** |
| **BBC World** | `https://feeds.bbci.co.uk/news/world/rss.xml` | ✅ **VALIDÉE** |
| **New York Times** | `https://rss.nytimes.com/services/xml/rss/nyt/World.xml` | ✅ **VALIDÉE** |
| **RT - Russie** | `https://www.rt.com/rss/` | ✅ **VALIDÉE** |
| **TASS (Agence russe)** | `https://tass.com/rss/v2.xml` | ✅ **VALIDÉE** |
| **Bloomberg** | `https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en` | ✅ **VALIDÉE** |
| **FOXNews** | `http://feeds.foxnews.com/foxnews/politics` | ✅ **VALIDÉE** |

---

## 🚀 INSTRUCTIONS POUR SUPABASE

### Méthode 1 : SQL Editor (RAPIDE)

1. Va sur https://supabase.com/dashboard
2. Ouvre ton projet
3. **SQL Editor** (menu gauche)
4. Copie-colle le contenu du fichier `RSS_URLS.sql`
5. Clique **RUN**

### Méthode 2 : Table Editor (MANUEL)

1. Va sur https://supabase.com/dashboard
2. **Table Editor** → Table `sources`
3. Pour chaque ligne, clique et modifie le champ `rss_url`
4. Colle l'URL correspondante

---

## ✅ VÉRIFICATION APRÈS AJOUT

Teste avec cette commande :
```bash
curl -s "https://daka-news-backend.onrender.com/api/sources" | jq '.sources.Israel[] | select(.name == "Ynet") | .rss_url'
```

Tu devrais voir : `"https://rss.mivzakim.net/rss/feed/1"`

---

## 🔄 SI TU VEUX CHANGER UNE URL

**DONNE-MOI LA NOUVELLE URL** et je mettrai à jour le fichier SQL.

**JE NE CHANGE JAMAIS LES URLs DE MOI-MÊME.**
