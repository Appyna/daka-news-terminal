# Notes pour l'équipe de review Apple

## 📱 Build 1.5.1 (24) - DAKA News

### 🎯 À propos de l'App Tracking Transparency (ATT)

**Notre app affiche la popup ATT conformément aux directives d'Apple.**

#### 📍 PROCÉDURE DE TEST EXACTE (Important !) :

**⏱️ TIMING CRITIQUE : La popup apparaît 8 SECONDES après le lancement**

1. **Installer l'app** sur un appareil iOS (iOS 14.5+)
2. **Première installation uniquement** - la popup ne s'affiche qu'une fois
3. **Lancer l'app** - l'écran principal avec les actualités s'affiche
4. **NE TOUCHEZ À RIEN pendant 10 secondes** - crucial pour voir la popup
5. **À la 8ème seconde**, la popup système iOS apparaît automatiquement :

```
"DAKA News" Would Like to Track Your Activity Across Other Companies' Apps and Websites

Nous utilisons cette autorisation pour personnaliser votre 
expérience et améliorer nos services. Vos données restent 
privées et protégées conformément à notre politique de confidentialité.

[Ask App Not to Track]  [Allow]
```

#### 🔧 Détails techniques :

- **Fichier** : `App.tsx` ligne ~38
- **Fonction** : `TrackingTransparency.requestTrackingPermissionsAsync()`
- **Délai** : 8000ms (8 secondes) après stabilisation de l'UI
- **Condition** : `status === 'undetermined'` (ne demande que si jamais demandé)
- **Logs console** : 5 logs de suivi pour débug

#### 🧪 Si la popup ne s'affiche pas :

**Causes possibles :**
1. ❌ L'app a déjà été installée - Supprimer et réinstaller
2. ❌ Réglages iOS modifiés - Aller dans Réglages > Confidentialité > Suivi
3. ❌ Test trop rapide - Attendre minimum 10 secondes sans toucher

**Solution :**
```
1. Supprimer complètement l'app de l'appareil
2. Redémarrer l'appareil
3. Réinstaller l'app
4. Lancer et attendre 10 secondes (avec chronomètre)
```

#### 📊 Utilisation du tracking :

Notre app utilise **RevenueCat** (react-native-purchases v9.10.1) pour :
- ✅ Gérer les abonnements cross-platform (iOS/Android)
- ✅ Prévenir la fraude sur les achats
- ✅ Analyser les performances des offres d'abonnement

**Conformité :**
- ✅ NSUserTrackingUsageDescription présent dans Info.plist
- ✅ Code ATT implémenté avec vérification du status
- ✅ Popup visible et fonctionnelle (délai 8s)
- ✅ Déclaration privacy cohérente (tracking activé)
- ✅ Aucune donnée vendue à des tiers

#### 📋 Déclaration App Store Connect :

- ✅ "Emplacement approximatif" → Sert à des fins de suivi : **OUI**
- ✅ NSUserTrackingUsageDescription configuré
- ✅ expo-tracking-transparency plugin intégré
- ✅ Conformité totale avec ATT Framework

---

### 🎥 Vidéo de démonstration disponible

Si vous avez des difficultés à voir la popup, nous pouvons fournir :
- 📹 Vidéo screen recording montrant la popup
- 📱 Build TestFlight avec logs activés
- 📞 Assistance en direct

---

### 📞 Contact urgent :

**Email** : projet.lgsz@gmail.com  
**Réponse** : < 2 heures pendant heures ouvrables  
**Fuseau horaire** : GMT+1 (Paris)

---

**Merci pour votre évaluation ! 🙏**

*Cette app respecte strictement les guidelines Apple concernant ATT et la confidentialité des utilisateurs.*
