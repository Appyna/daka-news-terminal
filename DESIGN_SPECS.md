# 🎨 DAKA News - Spécifications de Design (Version Web Originale)

**Date de sauvegarde :** 5 février 2026  
**Branche de référence :** `web-original`  
**Commit :** c37c042

---

## 📐 Système de Couleurs

### Couleurs principales
```javascript
COLORS = {
  dark1: '#0A0918',        // Background principal (le plus foncé)
  dark2: '#1A1838',        // Background modaux/cards (lightened)
  dark3: '#252550',        // Background hover/focus (lightened)
  accentYellow1: '#F5C518', // Jaune principal (logo, highlights)
  accentYellow2: '#FFD93D', // Jaune secondaire (gradients)
  white: '#FFFFFF'
}
```

### Opacités
- Texte principal : `text-white`
- Texte secondaire : `text-white/70` ou `text-white/75`
- Bordures : `border-white/5` ou `border-white/10`
- Backgrounds hover : `bg-white/5` ou `bg-white/8`

---

## 🔤 Typographie

### Tailles de texte
- **Titre article** : `text-sm font-bold`
- **Texte source** : `text-xs`
- **Label discret** : `text-[9px] uppercase tracking-wide`
- **Heure** : `text-[11px] font-mono`
- **Source badge** : `text-[10px] font-bold uppercase`
- **Disclaimer AI** : `text-[10.5px]`

### Espacements (NewsCard focusée)
- Padding : `px-3.5 py-6`
- Heure → Titre : `mb-4`
- Titre → Texte source : `mb-4 mt-5 pt-4`

---

## 🎯 Composants clés

### TopBar (Header)
- Hauteur : `h-[64px]`
- Background : `COLORS.dark2`
- Logo : côté gauche
- Avatar : côté droit

#### Avatar
- Taille : `w-10 h-10 rounded-full`
- Background : `COLORS.dark2`
- Texte : `font-light text-[1.30rem]` couleur `COLORS.accentYellow1`
- Bordure : `boxShadow: 0 0 0 0.4px yellow` (ultra-fin)
- Badge Premium : `w-3.5 h-3.5` position `-bottom-0.5 -right-0.5`

#### Menu déroulant Avatar
- **Non connecté** : Icône user gris
- **Connecté non-premium** : "Accès illimité aux infos" + "Déconnexion"
- **Connecté premium** : "Gérer mon abonnement" + "Déconnexion"

### Sidebar (Menu flux)
- Largeur : `w-[300px]`
- Background : `COLORS.dark2`
- Header : "Live" avec point vert animé
- Sources : `text-white/75` (visibles même verrouillées)
- Cadenas : `w-3 h-3` jaune pour sources premium
- Footer disclaimer : `text-[10.5px] text-white/40`
- Settings icon : `w-5 h-5`

### NewsCard
**État normal :**
- Padding : `p-3.5`
- Hover : `bg-white/5`

**État focusé :**
- Padding : `px-3.5 py-6` (pas de `my-1` pour éviter glissement)
- Background : `bg-white/8`
- Bordure : `boxShadow: 0 0 0 0.4px yellow` (ultra-fin)
- Titre : `text-yellow-500`
- Bouton partage : visible à droite avec icône + texte
- Texte source (si ≠ France) : 
  - Label : `TEXTE SOURCE` en `text-[9px] text-white/25`
  - Contour : `border-t border-white/10`
  - RTL pour hébreu : `direction: 'rtl'`

### Modaux
- Background : `COLORS.dark2`
- Header gradient : `linear-gradient(90deg, accentYellow1, accentYellow2)` hauteur `h-1`
- Bordure : `border-yellow-500/20`
- Close button : `top-4 right-4`

#### AuthModal
- Espacement : `space-y-6` (augmenté)
- AI disclaimer : `text-[11px]` (agrandi)
- Sans "Compte gratuit..." (supprimé)

#### PremiumModal
- 3 sources gratuites affichées
- Badge jaune "Gratuit" sur sources free
- Cadenas sur sources premium
- Bouton "Devenir Premium" jaune

#### SettingsModal
- Pas de titre
- 3 items : CGU/CGV (fusionné), Privacy, Contact (mailto)
- Ouvre LegalModal pour CGU et Privacy

---

## 🎨 Animations & Transitions

- Durée standard : `duration-300`
- Transitions : `transition-all` ou `transition-colors`
- Hover cards : `hover:bg-white/5`
- Focus cards : expansion douce sans glissement vertical

---

## 📱 Layout

### Structure
```
┌─────────────────────────────────────┐
│            TopBar (64px)            │
├─────────────────────────────────────┤
│                                     │
│  NewsColumn │ NewsColumn │ ...     │
│  (scrollable vertical)              │
│                                     │
├─────────────────────────────────────┤
│        Footer (recherche)           │
└─────────────────────────────────────┘
```

### NewsColumn
- Flex : `flex-1 min-w-[320px]`
- Header : nom source en `text-sm uppercase` jaune
- Body : scroll vertical avec cards

---

## ✅ Features implémentées

### Authentification
- ✅ Inscription / Connexion
- ✅ OTP (vérification email)
- ✅ Reset password (magic link)
- ✅ AuthContext avec Supabase

### Premium / Freemium
- ✅ 3 sources gratuites (Ynet, BFM TV, BBC World)
- ✅ Cadenas sur sources premium
- ✅ Modal Premium avec pricing
- ✅ Stripe checkout + webhooks
- ✅ Apple IAP webhooks
- ✅ Google Play webhooks
- ✅ Badge étoile Premium sur avatar

### UX
- ✅ NewsCard focus (pas de modal)
- ✅ Partage natif
- ✅ Texte source pour Israël/Monde
- ✅ Toggle focus (cliquer à nouveau ferme)
- ✅ Settings avec CGU/Privacy/Contact

---

## 🔧 Backend inchangé

**Render API :** https://daka-news-backend.onrender.com/api
- `/feeds/:sourceName` - Articles par source
- `/feeds/category/:category` - Articles par catégorie
- `/sources` - Liste des sources disponibles
- `/stripe/*` - Gestion paiements
- Webhooks : `/webhooks/stripe`, `/webhooks/apple`, `/webhooks/google`

**Supabase :**
- Table `sources` : flux RSS configurés
- Table `articles` : articles collectés + traduits
- Table `profiles` : utilisateurs
- Table `subscriptions` : abonnements premium

**Traduction :** OpenAI GPT-4o-mini (titre uniquement, pas description)

---

## 📝 Notes importantes pour migration React Native

### À préserver absolument
1. **Couleurs exactes** (surtout le jaune #F5C518)
2. **Espacements NewsCard focusée** (px-3.5 py-6, mb-4, mt-5 pt-4)
3. **Bordure ultra-fine 0.4px** (avatar + card focus)
4. **Texte source RTL** pour hébreu
5. **Toggle focus** (cliquer = fermer)
6. **Pas de glissement vertical** (pas de my-1 en focus)

### Adapter sur mobile
- Safe areas (notch iPhone)
- Colonnes → FlatList horizontal
- Modaux → Modal natif React Native
- Polices système (SF Pro iOS, Roboto Android)

---

**✅ Cette version web est COMPLÈTE et FONCTIONNELLE**  
**✅ Sauvegarde disponible sur branche `web-original`**  
**✅ Commit de référence : c37c042**
