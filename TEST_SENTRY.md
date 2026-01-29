# 🧪 TEST SENTRY - GUIDE RAPIDE

## ✅ Ce qui a été fait

J'ai créé une route de test : `/api/test-sentry`

Cette route provoque **volontairement** une erreur pour vérifier que Sentry capture bien les erreurs.

---

## ⏳ ATTENDRE 5 MINUTES

Render est en train de redéployer votre backend avec la nouvelle route de test.

**Attendez 5 minutes** que le déploiement se termine.

---

## 🧪 ÉTAPES DU TEST (dans 5 min)

### 1. Trouver l'URL de votre backend Render

Votre URL backend ressemble à :
```
https://daka-backend-XXXX.onrender.com
```

### 2. Appeler la route de test

**Ouvrez votre navigateur** et allez sur :
```
https://VOTRE-BACKEND.onrender.com/api/test-sentry
```

**OU** utilisez cette commande dans le terminal :
```bash
curl https://VOTRE-BACKEND.onrender.com/api/test-sentry
```

### 3. Vous verrez une erreur (c'est normal !)

Le navigateur affichera :
```
Internal Server Error
```

**C'est exactement ce qu'on veut !** L'erreur a été capturée par Sentry.

---

## 📧 CE QUI VA SE PASSER

### Dans les 10 secondes après le test :

1. **Sur Sentry.io** :
   - Allez sur https://sentry.io
   - Projet `daka-news-backend`
   - Vous verrez : **"1 New Issue"**
   - Cliquez dessus → Détails complets de l'erreur

2. **Dans votre email** :
   - Vous recevrez un email de Sentry
   - Sujet : "🧪 Test Sentry - Cette erreur est volontaire"
   - Avec : stack trace, URL, timestamp

3. **Sur le dashboard Sentry** :
   - Les "Start Setup" disparaîtront
   - Vous verrez : "Daily Errors: 1"
   - Des graphiques apparaîtront

---

## ✅ VÉRIFICATION FINALE

Une fois le test fait, sur https://sentry.io vous devriez voir :

```
✅ Daily Errors: 1
🔴 Error: 🧪 Test Sentry - Cette erreur est volontaire
📊 Environment: production
🌐 URL: /api/test-sentry
⏰ Timestamp: [date et heure]
```

---

## 🗑️ APRÈS LE TEST (optionnel)

Si vous voulez supprimer la route de test après avoir vérifié que Sentry fonctionne, je peux la retirer du code.

Mais vous pouvez aussi la **garder** pour tester Sentry quand vous voulez !

---

## 📝 RÉSUMÉ

1. ⏳ Attendre 5 min (déploiement Render)
2. 🌐 Ouvrir : `https://VOTRE-BACKEND.onrender.com/api/test-sentry`
3. 📧 Vérifier email de Sentry
4. 🎉 Confirmer que Sentry capture l'erreur

**Durée totale** : 5 minutes d'attente + 1 minute de test
