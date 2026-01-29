# 🔴 GUIDE SENTRY - MONITORING D'ERREURS (15 min)

## ✅ Qu'est-ce que Sentry ?

**Sentry** est un service gratuit qui surveille votre backend et vous **envoie un email** si :
- ❌ Le backend plante (crash)
- ❌ Une erreur OpenAI (autre que rate limit)
- ❌ Le CRON de collecte RSS échoue
- ❌ N'importe quelle erreur critique

**Plan gratuit** : 5,000 erreurs/mois (largement suffisant pour votre usage)

---

## 📝 ÉTAPE 1 : Créer un compte Sentry (5 min)

1. **Aller sur** : https://sentry.io/signup/
2. **S'inscrire** avec votre email (Google/GitHub aussi possible)
3. **Choisir** : "Node.js" comme plateforme
4. **Nom du projet** : `daka-news-backend`
5. **Plan** : Sélectionner "Developer" (GRATUIT)

---

## 🔑 ÉTAPE 2 : Récupérer votre DSN (2 min)

Après inscription, Sentry affiche automatiquement votre **DSN** (Data Source Name).

C'est une URL qui ressemble à :
```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

**SI VOUS NE VOYEZ PAS LE DSN** :
1. Aller dans **Settings** (⚙️ en haut à gauche)
2. Cliquer sur **Projects** → `daka-news-backend`
3. Cliquer sur **Client Keys (DSN)**
4. **Copier** le DSN affiché

---

## 🔧 ÉTAPE 3 : Ajouter le DSN dans votre `.env` (1 min)

### Sur votre machine (local)

Ouvrir le fichier `/backend/.env` et ajouter :

```bash
# Sentry Monitoring
SENTRY_DSN=https://VOTRE_DSN_ICI@o123456.ingest.sentry.io/7890123
```

### Sur Render (production)

1. **Aller sur** : https://dashboard.render.com
2. **Sélectionner** votre service backend
3. **Cliquer** sur "Environment" (menu de gauche)
4. **Ajouter** une nouvelle variable :
   - **Key** : `SENTRY_DSN`
   - **Value** : `https://VOTRE_DSN_ICI@o123456.ingest.sentry.io/7890123`
5. **Save Changes** → Le backend redémarrera automatiquement

---

## ✅ ÉTAPE 4 : Tester que ça marche (3 min)

### Test 1 : Vérifier le démarrage

Après avoir ajouté `SENTRY_DSN`, redémarrer le backend :

```bash
cd backend
npm run dev
```

**Vous devriez voir** dans les logs :
```
✅ Sentry initialisé - Monitoring actif
```

**Si vous voyez** :
```
⚠️ SENTRY_DSN manquant - Monitoring désactivé
```
→ Retournez à l'étape 3, le DSN n'est pas correctement ajouté.

---

### Test 2 : Créer une erreur volontaire

1. **Ouvrir** : `backend/src/routes/feeds.ts`
2. **Ajouter temporairement** cette ligne au début d'une route :

```typescript
throw new Error('🧪 Test Sentry - Cette erreur est volontaire');
```

3. **Redémarrer** le backend
4. **Appeler** l'API depuis le frontend (ou Postman)
5. **Aller sur Sentry.io** → Vous devriez voir l'erreur apparaître en temps réel
6. **Supprimer** la ligne de test

---

## 📧 ÉTAPE 5 : Configurer les alertes email (2 min)

Par défaut, Sentry envoie un email pour chaque erreur. **Pour éviter le spam** :

1. **Aller sur Sentry.io** → `daka-news-backend`
2. **Cliquer** sur **Alerts** (🔔 menu gauche)
3. **Créer une règle** :
   - **Nom** : "Erreurs critiques backend"
   - **Condition** : "An issue is first seen"
   - **Action** : "Send a notification via Email"
4. **Sauvegarder**

**Résultat** : Vous recevrez UN email par nouvelle erreur (pas 1000 emails pour la même erreur)

---

## 🎯 Ce qui sera surveillé maintenant

### ✅ Erreurs OpenAI
- Si OpenAI renvoie une erreur (autre que rate limit)
- Si la traduction échoue pour une raison technique
→ **Vous recevez un email avec** : texte original, langue, longueur, erreur exacte

### ✅ Erreurs CRON
- Si le CRON de collecte RSS plante
- Si Supabase est inaccessible
→ **Vous recevez un email avec** : timestamp, job concerné, stack trace

### ✅ Erreurs API
- Si une route Express plante
- Si un middleware échoue
→ **Vous recevez un email avec** : URL, méthode HTTP, erreur

### ❌ Ce qui n'est PAS surveillé (normal)
- Rate limit OpenAI → C'est normal, pas envoyé à Sentry
- Articles dupliqués → C'est normal (cache)
- Timeout de traduction → Article ignoré, pas une erreur critique

---

## 📊 Tableau de bord Sentry

Une fois en production, vous pourrez voir sur **Sentry.io** :

- **Nombre d'erreurs/jour**
- **Quelles erreurs reviennent le plus souvent**
- **Performance du backend** (temps de réponse moyen)
- **Utilisateurs affectés** (si on ajoute l'authentification plus tard)

---

## 🚨 Que faire si vous recevez un email Sentry ?

### Email : "TranslationError: OpenAI API failed"
→ **Cause probable** : Clé API invalide, quota dépassé, service down
→ **Action** : Vérifier le dashboard OpenAI, vérifier la clé API

### Email : "CronError: RSS Collection failed"
→ **Cause probable** : Supabase inaccessible, réseau down
→ **Action** : Vérifier Supabase, vérifier les logs Render

### Email : "FATAL ERROR: JavaScript heap out of memory"
→ **Cause probable** : Le problème de mémoire qu'on a identifié
→ **Action** : Migrer vers Railway OU optimiser les prompts

---

## 💡 Prochaines étapes (optionnel)

### Performance Monitoring (Sentry Trace)
Sentry peut aussi mesurer :
- Temps de réponse de chaque route API
- Temps d'exécution OpenAI
- Temps d'accès Supabase

**Actuellement configuré à 10%** (pour économiser le quota gratuit).

Si vous voulez voir les performances :
1. Aller sur Sentry.io → Performance
2. Vous verrez les routes les plus lentes

---

## ✅ CHECKLIST FINALE

- [ ] Compte Sentry créé sur https://sentry.io
- [ ] DSN récupéré (format : `https://xxx@oXXX.ingest.sentry.io/XXX`)
- [ ] DSN ajouté dans `/backend/.env` (local)
- [ ] DSN ajouté sur Render (production)
- [ ] Backend redémarré → Voir "✅ Sentry initialisé - Monitoring actif"
- [ ] Alerte email configurée sur Sentry.io
- [ ] Test volontaire effectué (erreur apparaît sur Sentry)

---

## 📞 Résumé technique (pour référence)

**Fichiers modifiés** :
- `/backend/src/config/sentry.ts` → Configuration Sentry
- `/backend/src/server.ts` → Initialisation + capture erreurs Express
- `/backend/src/services/translator.ts` → Capture erreurs OpenAI
- `/backend/src/cron/collector.ts` → Capture erreurs CRON RSS

**Packages ajoutés** :
```bash
@sentry/node@latest
@sentry/profiling-node@latest
```

**Variable d'environnement requise** :
```bash
SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
```

**Plan gratuit Sentry** :
- 5,000 erreurs/mois
- 10,000 transactions/mois (performance)
- Rétention : 90 jours
- Alertes email illimitées

---

## 🎉 TERMINÉ !

Vous avez maintenant un **système de monitoring professionnel** qui vous alertera en temps réel si le backend rencontre un problème.

**Durée totale** : ~15 minutes
**Coût** : 0€ (plan gratuit)
**Bénéfice** : Vous savez IMMÉDIATEMENT si quelque chose ne va pas, avant que vos utilisateurs s'en rendent compte.
