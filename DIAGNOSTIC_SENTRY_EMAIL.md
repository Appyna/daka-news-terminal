# 🔍 DIAGNOSTIC SENTRY - PAS D'EMAIL

## ✅ CHECKLIST DE VÉRIFICATION

### 1. Vérifier que l'alerte est bien sauvegardée

Sur Sentry.io :
1. **Aller sur** : https://sentry.io
2. **Votre projet** → `daka-news-backend`
3. **Menu gauche** → **Alerts**
4. **Vous devriez voir** : Votre règle "Erreurs critiques backend" dans la liste

**Si elle n'apparaît PAS** → L'alerte n'a pas été sauvegardée, il faut la recréer.

---

### 2. Vérifier vos paramètres de notification personnels

Sur Sentry.io :
1. **En haut à droite** → Cliquer sur votre avatar/photo
2. **User Settings** → **Notifications**
3. **Vérifier** :
   - ✅ "Email" est activé
   - ✅ "Issue Alerts" → "Always" ou "On"
   - ✅ Votre adresse email est confirmée

**Si email pas confirmé** → Vérifiez vos spams, confirmez l'email de Sentry.

---

### 3. Vérifier que Sentry reçoit bien les erreurs

Sur Sentry.io :
1. **Votre projet** → `daka-news-backend`
2. **Menu gauche** → **Issues**
3. **Vérifier** : Y a-t-il des erreurs affichées ?

**Si AUCUNE erreur** → Le test n'a pas fonctionné, il faut réessayer.
**Si erreurs présentes MAIS pas d'email** → Problème de configuration email.

---

### 4. Tester avec la route /api/test-sentry

**URL de votre backend Render** :
```
Allez sur Render → Votre service → Copiez l'URL
```

**Testez la route** :
```
https://VOTRE-URL-BACKEND.onrender.com/api/test-sentry
```

**Résultat attendu** :
- ❌ Page affiche "Internal Server Error"
- 📊 Sur Sentry.io → Une nouvelle erreur apparaît dans "Issues"
- 📧 Email arrive dans les 30 secondes

---

## 🔧 SOLUTIONS SELON LE PROBLÈME

### Problème A : Pas d'erreur dans Sentry Issues
**Cause** : Le test n'a pas fonctionné
**Solution** : 
1. Vérifier que Render a bien redéployé (logs Render : "✅ Sentry initialisé")
2. Réessayer d'appeler `/api/test-sentry`
3. Vérifier l'URL backend (doit finir par `.onrender.com`)

### Problème B : Erreur dans Issues MAIS pas d'email
**Cause** : Notifications email désactivées
**Solution** :
1. User Settings → Notifications → Activer "Email"
2. Confirmer votre adresse email si demandé
3. Réessayer le test

### Problème C : Email dans spam
**Cause** : Filtre anti-spam
**Solution** :
1. Chercher "Sentry" dans vos spams
2. Marquer comme "Pas spam"
3. Ajouter `alerts@sentry.io` dans vos contacts

### Problème D : Alerte pas sauvegardée
**Cause** : Erreur lors de la création
**Solution** : Recréer l'alerte (voir guide ci-dessous)

---

## 📧 RECRÉER L'ALERTE (si besoin)

1. **Sentry.io** → `daka-news-backend` → **Alerts** → **Create Alert**
2. **Select Alert Type** : Issues
3. **When** : An issue is first seen
4. **If** : All issues
5. **Then** : Send a notification (for all legacy integrations)
6. **Alert name** : Erreurs critiques backend
7. **Save Rule**

---

## 🧪 TEST MANUEL SIMPLE

Pour être sûr que Sentry capture les erreurs, faites ce test :

1. **Ouvrir votre navigateur**
2. **Aller sur** : `https://VOTRE-BACKEND.onrender.com/api/test-sentry`
3. **Attendre 10 secondes**
4. **Aller sur** : https://sentry.io → Issues
5. **Vous devriez voir** : 🔴 "🧪 Test Sentry - Cette erreur est volontaire"

**Si vous voyez l'erreur** = Sentry fonctionne !
**Si pas d'email** = Problème de configuration email (voir solutions ci-dessus)

---

## 📞 AIDE RAPIDE

**Quelle est votre situation ?**

A. Je ne vois AUCUNE erreur dans Sentry Issues
→ Le test n'a pas fonctionné, problème avec l'URL backend

B. Je vois l'erreur dans Issues MAIS pas d'email
→ Problème de configuration notifications

C. Je ne sais pas où trouver l'URL de mon backend
→ Render.com → Votre service → En haut, URL type `https://xxx.onrender.com`

D. J'ai testé plusieurs fois, toujours rien
→ Vérifier User Settings → Notifications → Email activé ?

---

## ✅ COMMANDE POUR TESTER (Terminal)

Si vous connaissez votre URL backend :

```bash
curl https://VOTRE-BACKEND.onrender.com/api/test-sentry
```

**Résultat** : Vous verrez une erreur HTML, c'est normal !
Puis allez sur Sentry.io pour vérifier.
