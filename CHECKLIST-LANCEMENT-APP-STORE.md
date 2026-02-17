# 🚀 CHECKLIST PRÉ-LANCEMENT APP STORE

**App : DAKA News iOS**  
**Date d'analyse : 17 février 2026**  
**Statut technique : ✅ OPÉRATIONNEL (17/17 checks Expo Doctor)**

---

## 📊 RÉSUMÉ EXÉCUTIF

### ✅ CE QUI EST PRÊT (80%)

- **Architecture technique** : Expo 54, React Native 0.81.5, TypeScript
- **Backend** : API Render (api.dakanews.com) opérationnelle
- **Base de données** : Supabase avec sources dynamiques
- **Notifications Push** : Fonctionnelles avec batching optimisé
- **Sources RSS** : 20 sources actives (Israel/France/Monde)
- **Traductions** : OpenAI GPT-4 avec prompts éditoriaux professionnels
- **Partage d'articles** : Format personnalisé sans astérisques
- **CGU/Privacy Policy** : Rédigées et intégrées dans SettingsModal
- **Icônes & Splash** : Tous les assets présents

### ⚠️ CE QUI MANQUE (20%)

1. **App Store Connect** : Pas encore configuré
2. **Screenshots marketing** : Non créés
3. **Description App Store** : À rédiger
4. **Test avec TestFlight** : Pas fait avec bêta-testeurs
5. **IAP (In-App Purchase)** : Désactivé (Expo 54 incompatibilité)
6. **Privacy Policy URL** : Doit être hébergée en ligne
7. **Support URL** : Pas de page support publique

---

## 🎯 PLAN D'ACTION COMPLET

### 📱 PARTIE 1 : APP STORE CONNECT (OBLIGATOIRE)

#### ✅ Étape 1 : Créer l'app dans App Store Connect

**Actions** :
1. Va sur https://appstoreconnect.apple.com
2. Clique "Apps" → "+" → "New App"
3. Remplis :
   - **Platform** : iOS
   - **Name** : `DAKA News`
   - **Primary Language** : French (France)
   - **Bundle ID** : `com.dakanews.app` (déjà dans app.json)
   - **SKU** : `dakanews-2026` (identifiant interne unique)
   - **User Access** : Full Access

**Durée** : 5 minutes

---

#### ✅ Étape 2 : Préparer les informations marketing

**2.1 - Description App Store (OBLIGATOIRE)**

**Proposition de texte (2000 caractères max)** :

```
Restez informé en temps réel avec DAKA News, votre source d'actualités Israël, France et International.

🌍 ACTUALITÉS MONDIALES EN UN CLIN D'OEIL

• Israël : Ynet, Arutz 7, Arutz 14, Israel Hayom, Walla, Maariv, Behadrei Haredim
• France : France Info, Le Monde, BFM TV, CNews, AFP-Mediapart
• Monde : Reuters, BBC News, FOXNews, RT, TASS, ANADOLU

📲 FONCTIONNALITÉS

✓ Agrégation temps réel de 20+ sources fiables
✓ Traduction automatique français des titres étrangers
✓ Lecture du texte source original (hébreu, anglais)
✓ Notifications push personnalisées
✓ Interface épurée, navigation intuitive par colonnes
✓ Accès direct aux articles complets d'un clic
✓ Mode sombre optimisé batterie

🆓 VERSION GRATUITE

Accès à 3 sources premium :
• Ynet (Israël)
• France Info (France)
• Reuters (Monde)

Articles mis à jour toutes les 3 minutes.

💎 VERSION PREMIUM (1,99€/mois)

Débloquez l'intégralité des 20+ sources d'actualités.
Annulation à tout moment.

🔒 CONFIDENTIALITÉ

Vos données sont sécurisées. Aucune publicité, aucun tracker publicitaire. Seules les données d'usage anonymes sont collectées pour améliorer l'app.

📖 TRADUCTION PROFESSIONNELLE

Chaque titre est traduit par IA (GPT-4) selon des règles éditoriales strictes garantissant neutralité et fidélité au contenu original.

🇫🇷 FAIT POUR LA COMMUNAUTÉ FRANCOPHONE

Suivez l'actualité israélienne, française et internationale sans barrière linguistique.

───

Support : dakanewsapp@gmail.com
CGU & Confidentialité : disponibles dans l'app (Paramètres)
```

**Durée** : 10 minutes

---

**2.2 - Mots-clés App Store (100 caractères max, séparés par virgules)**

```
actualités,israël,france,info,nouvelles,journaux,ynet,monde,rtl,bfm,reuters
```

**2.3 - URL de support (OBLIGATOIRE)**

**Options** :
- **Option A (Simple)** : Créer une page GitHub : `https://github.com/Appyna/daka-news-terminal/blob/master/SUPPORT.md`
- **Option B (Pro)** : Créer page sur ton site : `https://dakanews.com/support`

**Contenu minimal requis** :
```markdown
# Support DAKA News

## Contact
Email : dakanewsapp@gmail.com
Réponse sous 24-48h

## FAQ
**Q : Comment annuler mon abonnement ?**
R : Réglages iPhone → Apple ID → Abonnements → DAKA News → Annuler

**Q : Les articles ne se chargent pas ?**
R : Vérifiez votre connexion Internet. Si le problème persiste, contactez-nous.

**Q : Comment changer mes notifications ?**
R : Dans l'app : Menu (☰) → Paramètres → Notifications
```

**Durée** : 15 minutes

---

**2.4 - Privacy Policy URL (OBLIGATOIRE)**

**Option A (Simple)** : Héberger sur GitHub
```
https://github.com/Appyna/daka-news-terminal/blob/master/PRIVACY-POLICY.md
```

**Option B (Pro)** : Héberger sur ton site
```
https://dakanews.com/privacy
```

**⚠️ IMPORTANT** : App Store Review **REJETTE** si Privacy Policy n'est pas accessible en ligne (ne suffit pas d'être dans l'app).

**Action** :
1. Extraire le contenu de `SettingsModal.tsx` (section Privacy)
2. Créer fichier `PRIVACY-POLICY.md` à la racine
3. Le commit/push GitHub OU le mettre sur dakanews.com

**Durée** : 10 minutes

---

#### ✅ Étape 3 : Créer les screenshots (OBLIGATOIRE)

**Apple exige des screenshots pour 3 tailles minimum** :
- iPhone 6.7" (iPhone 15 Pro Max)
- iPhone 6.5" (iPhone 14 Plus)
- iPhone 5.5" (iPhone 8 Plus)

**Méthode rapide** :
1. Lance l'app sur ton iPhone physique
2. Prends 4-6 screenshots représentatifs :
   - Écran d'accueil (colonnes d'articles)
   - Article en focus avec texte source
   - Menu latéral (sidebar)
   - Paramètres (optionnel)
   - Modal Premium (optionnel)

3. **Redimensionner pour App Store** :
   - Utilise https://www.appscreenshots.com/ (gratuit)
   - OU Figma / Canva pour ajouter des overlays marketing

**Exemples de ce que Apple aime** :
- Texte overlay expliquant les features
- Fond coloré avec mockup iPhone
- Flèches pointant vers fonctionnalités clés

**Durée** : 30-60 minutes (selon qualité voulue)

---

#### ✅ Étape 4 : Informations complémentaires App Store

**À remplir dans App Store Connect** :

| Champ | Valeur |
|-------|--------|
| **Category** | News |
| **Secondary Category** | (optionnel) |
| **Age Rating** | 4+ (aucun contenu sensible) |
| **Copyright** | 2026 DAKA News |
| **Support URL** | https://dakanews.com/support OU GitHub |
| **Privacy Policy URL** | https://dakanews.com/privacy OU GitHub |
| **Version** | 1.0.0 (déjà dans app.json) |
| **What's New** | Première version de DAKA News : actualités Israël, France, Monde en temps réel ! |

**Durée** : 10 minutes

---

### 🧪 PARTIE 2 : TESTER AVEC TESTFLIGHT (RECOMMANDÉ)

**Pourquoi** : TestFlight permet de tester l'app **exactement comme** sur App Store (même build, mêmes permissions) avec des bêta-testeurs avant la soumission officielle.

#### ✅ Étape 1 : Build de production

**Commande** :
```bash
cd mobile-v2
eas build --platform ios --profile production
```

**Attendre** : 15-20 minutes

---

#### ✅ Étape 2 : Soumettre à TestFlight

**Commande** :
```bash
eas submit --platform ios
```

**Apple login requis** : Utilise ton Apple ID développeur

**Durée traitement Apple** : 1-2 heures (review automatique)

---

#### ✅ Étape 3 : Inviter des testeurs

**Dans App Store Connect** :
1. Va dans "TestFlight"
2. Clique "Internal Testing" → "Add Testers"
3. Ajoute 5-10 emails de proches/amis
4. Ils reçoivent un email avec lien TestFlight

**Tester pendant 3-7 jours** :
- Vérifier crashs
- Tester notifications
- Tester partage
- Tester scroll/navigation
- Tester connexion/déconnexion

---

### 📝 PARTIE 3 : SOUMISSION APP STORE (FINALE)

#### ✅ Étape 1 : Soumettre pour review

**Dans App Store Connect** :
1. Va dans "App Store" (pas TestFlight)
2. Clique "+" sous "iOS App"
3. Remplis tous les champs (description, screenshots, etc.)
4. Sélectionne le build (celui uploadé avec `eas submit`)
5. Clique "Submit for Review"

---

#### ✅ Étape 2 : Préparer les informations de review

**Apple va demander** :

**Export Compliance** : 
- Question : "Does your app use encryption?"
- Réponse : ❌ Non (tu utilises HTTPS standard, ce n'est pas considéré comme "encryption" au sens ITAR)
- Déjà défini dans app.json : `"ITSAppUsesNonExemptEncryption": false`

**Advertising Identifier** :
- Question : "Does your app use the Advertising Identifier (IDFA)?"
- Réponse : ❌ Non (pas de pub, pas de tracking pub)

**Content Rights** :
- Question : "Do you have the necessary rights to all content?"
- Réponse : ✅ Oui (flux RSS publics, traductions sous licence OpenAI)

**Demo Account** (si demandé) :
- Apple peut demander un compte test pour tester l'app
- Crée un compte : `appletester@dakanews.com` / `TestDaka2026!`
- Fournis login/password dans les notes de review

---

#### ✅ Étape 3 : Attendre la review

**Délai moyen** : 24-48 heures (parfois 1 semaine)

**Statuts possibles** :
- ✅ **Approved** : L'app est publiée ! (ou en "Ready for Sale" si tu as choisi publication manuelle)
- ⚠️ **Metadata Rejected** : Problème de description/screenshots → Corriger et resoumettre (rapide)
- ❌ **Rejected** : Problème technique/légal → Lire les raisons, corriger, rebuild, resoumettre

**Taux d'acceptation première soumission** : ~40% (normal, ne pas paniquer)

---

### ⚠️ PARTIE 4 : PROBLÈMES POTENTIELS (À ANTICIPER)

#### ❌ Problème 1 : IAP désactivé (In-App Purchase)

**État actuel** :
```tsx
// App.tsx
// import { iapService } from './src/services/IAPService'; // TODO: Réactiver après fix Expo IAP
```

**Impact** : L'app ne peut PAS vendre d'abonnement Premium via Apple.

**Solutions** :

**Option A (Court terme - RECOMMANDÉ)** : Lancement gratuit uniquement
- Retirer toute mention "Premium" de l'app
- Activer toutes les sources en gratuit temporairement
- Lancer sur App Store en version gratuite
- Ajouter IAP dans version 1.1 plus tard

**Code à modifier** :
```tsx
// constants.ts - Rendre toutes les sources gratuites
export const FREE_SOURCES = [
  "Ynet", "Arutz 7", "Arutz 14", "Behadrei Haredim", "Israel Hayom", 
  "JDN Hadachot", "Walla", "Maariv", "France Info", "Le Monde", 
  "BFM TV", "CNews", "Dépêches AFP - Mediapart", "France Bleu",
  "Reuters · AP | U.S. News", "BBC News", "FOXNews", "RT - Russie",
  "ANADOLU (Agence turque)", "TASS (Agence russe)"
];
```

**Masquer le bouton Premium** :
```tsx
// TopBar.tsx - Commenter le bouton Premium
// <Pressable onPress={onPremiumPress}>...</Pressable>
```

**Option B (Long terme)** : Attendre fix Expo IAP
- Suivre https://github.com/expo/expo/issues/...
- Patcher `react-native-iap` si possible
- Ou downgrade Expo 53 (risqué)

**Recommandation** : **Option A** pour lancer rapidement, ajouter IAP en v1.1

---

#### ❌ Problème 2 : Privacy Policy pas en ligne

**Apple rejette si** :
- Privacy Policy uniquement dans l'app (pas accessible depuis web)
- URL cassée ou 404
- Pas en français (si app principale en français)

**Solution** :
1. Créer `PRIVACY-POLICY.md` à la racine du repo GitHub
2. Push sur GitHub
3. URL finale : `https://github.com/Appyna/daka-news-terminal/blob/master/PRIVACY-POLICY.md`
4. Ou héberger sur dakanews.com/privacy

---

#### ❌ Problème 3 : Screenshots manquants

**Apple rejette si** :
- Moins de 2 screenshots
- Screenshots ne correspondent pas à la taille d'écran
- Screenshots contiennent du contenu adulte/violent (peu probable pour actualités)

**Solution** : Prendre 4-6 screenshots sur iPhone réel, redimensionner avec outil en ligne

---

#### ❌ Problème 4 : Contenu des actualités sensible

**Risque** : Si les flux RSS affichent des titres violents/choquants, Apple peut demander un Age Rating plus élevé (12+, 17+)

**Solution préventive** :
- Mettre Age Rating à **12+** (au lieu de 4+) dans App Store Connect
- Cocher "Infrequent/Mild Realistic Violence" (actualités de guerre possibles)

---

#### ❌ Problème 5 : Droits sur les contenus

**Apple peut demander** :
- Preuves que tu as le droit d'utiliser les flux RSS
- Autorisation des médias sources

**Solution** :
- Flux RSS = publics par nature (pas de paywall)
- Tu ne republies PAS l'article complet, juste le titre + lien
- Ajouter dans notes de review :
  > "L'app agrège des flux RSS publics (Fair Use / Usage équitable). Aucun contenu intégral n'est republié. Liens directs vers articles originaux fournis. Tout éditeur peut demander le retrait via dakanewsapp@gmail.com."

---

### 🎯 PARTIE 5 : TIMELINE RÉALISTE

| Étape | Durée | Cumulé |
|-------|-------|--------|
| **App Store Connect** : Créer app | 5 min | 5 min |
| **Marketing** : Description, keywords | 15 min | 20 min |
| **Support URL** : Créer page GitHub | 10 min | 30 min |
| **Privacy Policy** : Héberger en ligne | 10 min | 40 min |
| **Screenshots** : Prendre + redimensionner | 60 min | 1h40 |
| **Build production** : `eas build` | 20 min | 2h |
| **Submit** : `eas submit` | 5 min | 2h05 |
| **TestFlight review** : Automatique | 1-2h | 4h |
| **Bêta-test** : Inviter 5-10 testeurs | 3-7 jours | 1 semaine |
| **Corrections bugs** : Si trouvés | 1-2 jours | 1-2 semaines |
| **Soumission App Store** : Remplir formulaire | 30 min | - |
| **Apple Review** : Attente | 1-3 jours | 2-3 semaines |
| **Publication** : Si approuvé | Instantané | **LANCÉ !** |

**Timeline optimiste** : 2 semaines (si pas de rejet)  
**Timeline réaliste** : 3-4 semaines (avec 1 rejet + corrections)

---

### 📋 CHECKLIST FINALE AVANT SOUMISSION

#### ✅ Technique
- [ ] `eas build --platform ios --profile production` réussi
- [ ] App testée sur iPhone physique (pas simulateur)
- [ ] Notifications push fonctionnelles
- [ ] Partage d'articles fonctionne
- [ ] Toutes les sources chargent des articles
- [ ] Pas de crash au lancement
- [ ] Pas d'erreur dans Xcode logs

#### ✅ App Store Connect
- [ ] App créée avec bundle ID `com.dakanews.app`
- [ ] Description (français) rédigée
- [ ] 4-6 screenshots uploadés
- [ ] Mots-clés définis
- [ ] Support URL active
- [ ] Privacy Policy URL active
- [ ] Age Rating configuré (12+)
- [ ] Copyright renseigné

#### ✅ Légal
- [ ] CGU intégrées dans SettingsModal ✅
- [ ] Privacy Policy intégrée dans SettingsModal ✅
- [ ] Privacy Policy accessible en ligne (GitHub ou site)
- [ ] Contact email valide : dakanewsapp@gmail.com
- [ ] Section "retrait de flux" dans CGU ✅

#### ✅ Contenu
- [ ] Toutes les sources RSS fonctionnent (test avec `nombre_articles > 0`)
- [ ] Traductions activées (backend redéployé)
- [ ] Format de partage correct (sans astérisques)
- [ ] Ordre des sources correct (Reuters en 1er dans Monde)

#### ✅ Premium (si activé)
- [ ] IAP configuré dans App Store Connect
- [ ] Prix défini (1,99€/mois)
- [ ] Webhooks Apple configurés (backend)
- [ ] Test sandbox réussi

**OU si Premium désactivé** :
- [ ] Toutes les sources en gratuit dans `constants.ts`
- [ ] Bouton "Premium" masqué
- [ ] Aucune mention d'abonnement dans description App Store

---

## 🚨 DÉCISIONS STRATÉGIQUES À PRENDRE

### Décision 1 : Lancement avec ou sans Premium ?

**Option A : Sans Premium (RAPIDE - 2 semaines)**
✅ Pros :
- Pas besoin de configurer IAP
- Pas de risque rejet Apple sur IAP
- Lancement rapide
- Feedback utilisateurs immédiat
- Construire audience d'abord

❌ Cons :
- Pas de revenu immédiat
- Coûts serveur (Render $25/mois + Supabase Pro $25/mois + OpenAI ~$50-100/mois)
- Devoir mettre à jour app plus tard pour ajouter IAP

**Option B : Avec Premium (LONG - 4-6 semaines)**
✅ Pros :
- Revenu dès le lancement
- Fonctionnalité complète

❌ Cons :
- Besoin de fixer Expo IAP
- Configuration IAP App Store complexe
- Risque rejet Apple plus élevé
- Délai plus long

**Recommandation** : **Option A** (sans Premium) pour MVP rapide, ajouter IAP en version 1.1

---

### Décision 2 : TestFlight ou soumission directe ?

**Option A : TestFlight d'abord (RECOMMANDÉ)**
- 5-10 bêta-testeurs pendant 1 semaine
- Découvrir bugs avant review Apple
- Risque rejet réduit

**Option B : Soumission directe App Store**
- Plus rapide (gain 1 semaine)
- Risque rejet plus élevé
- Bugs découverts par Apple ou utilisateurs finaux (mauvaise première impression)

**Recommandation** : **Option A** (TestFlight)

---

### Décision 3 : Age Rating

**Options** :
- **4+** : Aucun contenu sensible → Risque rejet si actualités violentes apparaissent
- **12+** : "Infrequent/Mild Realistic Violence" → Sécurisé, Apple accepte
- **17+** : Contenu adulte → Overkill pour actualités

**Recommandation** : **12+** (sécurisé)

---

## 🎯 PLAN D'ACTION RECOMMANDÉ (NEXT STEPS)

### 🔥 CETTE SEMAINE (Semaine 1)

**Lundi** :
1. Créer app dans App Store Connect (5 min)
2. Rédiger description App Store (15 min)
3. Créer page Support sur GitHub (10 min)
4. Héberger Privacy Policy sur GitHub (10 min)

**Mardi** :
1. Prendre screenshots sur iPhone (30 min)
2. Redimensionner screenshots (30 min)
3. Uploader dans App Store Connect (10 min)

**Mercredi** :
1. Build production : `eas build --platform ios --profile production` (20 min)
2. Submit à TestFlight : `eas submit --platform ios` (5 min)
3. Attendre review automatique TestFlight (1-2h)

**Jeudi** :
1. Inviter 5-10 testeurs TestFlight (10 min)
2. Attendre feedback

### 📱 SEMAINE 2 (Bêta-test)

**Lundi-Vendredi** :
- Collecter feedback testeurs
- Corriger bugs critiques si trouvés
- Rebuild si nécessaire

**Samedi** :
- Remplir formulaire complet App Store Connect (30 min)
- Soumettre pour review Apple

### ⏳ SEMAINE 3-4 (Review Apple)

**Attente** : 1-3 jours review Apple

**Si rejet** :
- Lire raisons
- Corriger
- Rebuild
- Resoumettre

**Si approuvé** :
- 🎉 **APP LANCÉE SUR APP STORE !**

---

## 💰 COÛTS ESTIMÉS

| Poste | Coût mensuel | Coût annuel |
|-------|--------------|-------------|
| **Apple Developer** | $8.25 (~8€) | $99 (~99€) |
| **Render (backend)** | $25 | $300 |
| **Supabase Pro** | $25 | $300 |
| **OpenAI API** | $50-150 (selon usage) | $600-1800 |
| **Domaine (dakanews.com)** | ~$1 | ~$12 |
| **TOTAL** | **$109-209/mois** | **$1311-2511/an** |

**Sans revenu Premium** : Déficit de $109-209/mois  
**Avec Premium** (objectif 100 abonnés × 1,99€) : $199/mois → Break-even à ~100 utilisateurs premium

---

## 🆘 RESSOURCES UTILES

### Documentation officielle
- **App Store Review Guidelines** : https://developer.apple.com/app-store/review/guidelines/
- **Expo EAS Build** : https://docs.expo.dev/build/introduction/
- **Expo EAS Submit** : https://docs.expo.dev/submit/introduction/
- **TestFlight** : https://developer.apple.com/testflight/

### Outils
- **Screenshot Generator** : https://www.appscreenshots.com/
- **App Store Optimization** : https://www.apptweak.com/
- **Privacy Policy Generator** : https://www.freeprivacypolicy.com/

### Support
- **Apple Developer Support** : https://developer.apple.com/contact/
- **Expo Discord** : https://chat.expo.dev/

---

## ✅ CONCLUSION

**Ton app est à 80% prête pour l'App Store.**

**Les 20% manquants sont administratifs/marketing** :
1. Créer app dans App Store Connect (5 min)
2. Rédiger textes marketing (15 min)
3. Créer support/privacy URLs (20 min)
4. Prendre screenshots (60 min)
5. Build + submit (25 min)
6. Attendre review Apple (1-3 jours)

**Temps total travail actif** : ~2h30  
**Temps total avec attentes** : 2-4 semaines

**Recommandation** : Commence par **Partie 1** (App Store Connect) cette semaine, puis **TestFlight** semaine prochaine, puis **soumission finale** semaine 3.

**Besoin d'aide** : Je peux t'assister sur chaque étape si besoin !

---

**Dernière mise à jour** : 17 février 2026  
**Prochaine action** : Créer app dans App Store Connect (5 min)
