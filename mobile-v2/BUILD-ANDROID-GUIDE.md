# 🤖 GUIDE BUILD ANDROID - DAKA NEWS

## ✅ PRÉPARATION TERMINÉE

Toutes les modifications ont été faites pour préparer l'app Android :
- ✅ Package name Android : `app.dakanews.com` (match Google Play existant)
- ✅ iOS intact : `com.app.dakanews` (Build 15 soumis à Apple)
- ✅ RevenueCat configuré pour Android
- ✅ 0 erreur TypeScript

---

## 🔑 ÉTAPE 1 : OBTENIR CLÉ REVENUECAT ANDROID (5 min)

**Avant de builder, vous devez obtenir la clé API Android de RevenueCat.**

### Actions :

1. **Aller sur RevenueCat Dashboard** : https://app.revenuecat.com
2. **Connecter Google Play** :
   - Projects → Settings → **Google Play**
   - Cliquer "Connect to Google Play"
   - Suivre les instructions (Google Cloud Service Account)
3. **Copier la clé API Android** :
   - Projects → API Keys
   - Copier la clé commençant par `goog_...`

4. **Modifier `IAPService.ts`** (ligne 25) :
   ```typescript
   apiKey: Platform.OS === 'ios' 
     ? 'appl_JzBGrniAoiIvnDUEGYdBakscCdq' // iOS
     : 'goog_VOTRE_CLE_ICI' // ← Remplacer ici
   ```

**Documentation complète** : https://www.revenuecat.com/docs/creating-play-service-credentials

---

## 🏗️ ÉTAPE 2 : BUILDER L'APP ANDROID (20 min)

### 2.1. Se connecter à EAS (une seule fois)

```bash
cd "/Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2"
npx eas login
```

Entrer vos identifiants Expo.

---

### 2.2. Lancer le build Android

```bash
npx eas build --platform android --profile production
```

**Ce qui va se passer :**
- EAS compile l'app sur les serveurs Expo
- Génère un fichier `.aab` (Android App Bundle)
- Durée : ~15-20 minutes
- Vous recevrez un lien pour télécharger le `.aab`

---

### 2.3. Télécharger le fichier .aab

Une fois le build terminé :
1. Cliquer sur le lien fourni par EAS
2. Télécharger `app-release.aab`
3. Sauvegarder dans un dossier sécurisé

---

## 📤 ÉTAPE 3 : UPLOADER SUR GOOGLE PLAY (10 min)

### 3.1. Aller sur Google Play Console

URL : https://play.google.com/console

Naviguer vers : **DAKA News** → **Production**

---

### 3.2. Créer une nouvelle version

1. Cliquer sur **"Créer une nouvelle version"**
2. Uploader le fichier `app-release.aab`
3. Remplir les **notes de version** :

```
Version 1.5.0 - Mise à jour majeure

✨ Nouveautés :
• Traduction automatique Google Translate (Hébreu → Français)
• Interface redessinée et plus rapide
• Validation améliorée des noms d'utilisateur
• Nouvelles sources gratuites (ANADOLU en tête)
• Corrections de bugs et améliorations de performances

🔒 Sécurité :
• Mise à jour des bibliothèques
• Conformité RGPD renforcée
```

---

### 3.3. Soumettre en "Internal Testing" d'abord

**Pourquoi ?**
- Tester l'app sur un vrai device Android
- Vérifier que l'IAP fonctionne (Google Play Billing)
- Vérifier que tout est identique à iOS

**Comment ?**
1. Choisir **"Internal Testing"** au lieu de "Production"
2. Ajouter votre email comme testeur
3. Cliquer "Publish" (review Google : 1-2h)
4. Installer l'app depuis le lien de test

---

### 3.4. Tester l'app Android

**Checklist de test :**
- [ ] App s'ouvre correctement
- [ ] Authentification Supabase fonctionne
- [ ] Articles chargent (Israel, France, Monde)
- [ ] Google Translate fonctionne (bouton sur Israel/Monde)
- [ ] Sources gratuites accessibles (Ynet, France Info, ANADOLU)
- [ ] Premium IAP s'ouvre (modal Google Play)
- [ ] Achat Premium fonctionne (sandbox)
- [ ] Sources premium débloquées après achat

---

### 3.5. Passer en Production

**Une fois tous les tests OK :**
1. Retourner sur Google Play Console
2. **Production** → "Créer une nouvelle version"
3. Uploader le **même fichier .aab**
4. Remplir les mêmes notes de version
5. Cliquer "Publish"

**Review Google Play : 1-3 jours**

---

## 🎯 CE QUI VA SE PASSER POUR VOS 177 UTILISATEURS

**Dès que Google approuve :**
- ✅ Vos 177 utilisateurs recevront une notification "Mise à jour disponible"
- ✅ Ils cliquent "Mettre à jour" dans Google Play
- ✅ L'ancienne version (GoodBarber v1.1) est remplacée par la nouvelle (React Native v1.5.0)
- ✅ Leurs comptes restent intacts (même package name `app.dakanews.com`)
- ✅ Leurs reviews et notes sont conservées

---

## 🔍 VÉRIFICATIONS FINALES

### Avant de soumettre à Google, vérifier :

**Dans Google Play Console :**
- [ ] Package name : `app.dakanews.com` ✅
- [ ] Screenshots Android uploadés (minimum 2)
- [ ] Feature Graphic (1024x500) uploadé
- [ ] Icône 512x512 uploadée
- [ ] Privacy Policy URL : https://github.com/Appyna/daka-news-terminal/blob/master/PRIVACY-POLICY.md
- [ ] Descriptions à jour (voir `GOOGLE-PLAY-STORE.md`)

**Dans RevenueCat Dashboard :**
- [ ] Google Play connecté
- [ ] Product ID Android configuré : `premium_monthly`
- [ ] Entitlement "premium" créé
- [ ] Offering "default" avec package monthly

**Dans Supabase :**
- [ ] Table `subscriptions` prête
- [ ] RLS policies configurées
- [ ] Même structure que iOS (pas de modification nécessaire)

---

## 🆘 AIDE ET DÉPANNAGE

### Erreur "Package name déjà utilisé"
**Solution :** C'est normal ! Vous mettez à jour votre app existante. Continuez.

### Erreur "Google Play Billing non configuré"
**Solution :** 
1. Aller sur Google Play Console → Monétisation
2. Créer produit : `premium_monthly` (1,99€/mois)
3. Copier le Product ID dans RevenueCat

### Build EAS échoue
**Solution :**
1. Vérifier que `eas.json` existe dans mobile-v2/
2. Vérifier connexion internet stable
3. Consulter les logs : `npx eas build:list`

### IAP ne fonctionne pas sur Android
**Solution :**
1. Vérifier que la clé RevenueCat Android est correcte dans `IAPService.ts`
2. Vérifier que le produit `premium_monthly` existe dans Google Play Console
3. Tester avec un compte testeur (pas votre compte principal)

---

## 📞 SUPPORT

**Documentation RevenueCat Android** : https://www.revenuecat.com/docs/android
**Documentation EAS Build** : https://docs.expo.dev/build/setup/
**Google Play Console Help** : https://support.google.com/googleplay/android-developer

---

## ✅ RÉSUMÉ DES COMMANDES

```bash
# 1. Se connecter à EAS (une fois)
cd "/Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2"
npx eas login

# 2. Builder Android
npx eas build --platform android --profile production

# 3. Vérifier le statut
npx eas build:list

# 4. Télécharger le .aab quand prêt
# (lien fourni par EAS dans le terminal)
```

---

**🎉 Une fois déployé, vos utilisateurs auront la même app iOS/Android avec toutes les features Build 15 !**
