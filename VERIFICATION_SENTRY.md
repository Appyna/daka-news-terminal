# 🔍 VÉRIFICATION SENTRY SUR RENDER

## ÉTAPE 1 : Vérifier la variable d'environnement

1. **Aller sur** : https://dashboard.render.com
2. **Cliquer** sur votre service backend (celui qui tourne actuellement)
3. **Menu gauche** → "Environment"
4. **Chercher** : `SENTRY_DSN`

### ✅ Si vous voyez :
```
SENTRY_DSN = https://2d46ba3b40cd89b759bb02dc1b17cac1@o4510427503329280.ingest.de.sentry.io/4510793282093136
```
→ La variable est bien ajoutée !

### ❌ Si vous NE voyez PAS cette ligne :
→ La variable n'a pas été ajoutée. Retournez ajouter :
- **Key** : `SENTRY_DSN`
- **Value** : `https://2d46ba3b40cd89b759bb02dc1b17cac1@o4510427503329280.ingest.de.sentry.io/4510793282093136`

---

## ÉTAPE 2 : Vérifier les logs de déploiement

1. **Sur Render** → Votre service backend
2. **Menu gauche** → "Logs"
3. **Scroller** jusqu'au dernier redémarrage
4. **Chercher** cette ligne :

```
✅ Sentry initialisé - Monitoring actif
```

### ✅ Si vous la voyez :
→ Sentry fonctionne parfaitement !

### ❌ Si vous voyez :
```
⚠️ SENTRY_DSN manquant - Monitoring désactivé
```
→ La variable n'a pas été prise en compte. Il faut :
1. Vérifier que `SENTRY_DSN` est bien dans Environment
2. Cliquer sur "Manual Deploy" → "Deploy latest commit" pour forcer un redémarrage

### ❌ Si vous ne voyez RIEN du tout :
→ Le code Sentry n'est pas déployé sur Render. Il faut :
1. **Git push** le code sur votre repo GitHub
2. Sur Render → "Manual Deploy" → "Deploy latest commit"

---

## ÉTAPE 3 : Test final (créer une erreur volontaire)

Si Sentry est bien activé dans les logs, testez avec cette URL :

```
https://VOTRE-BACKEND-RENDER.onrender.com/
```

Puis allez sur https://sentry.io → Vous devriez voir au moins 1 événement.

---

## 🆘 PROBLÈME DÉTECTÉ ?

### Problème 1 : La variable SENTRY_DSN n'est pas dans Environment
→ **Solution** : L'ajouter maintenant

### Problème 2 : Les logs ne montrent rien sur Sentry
→ **Solution** : Le code n'est pas déployé, il faut faire un `git push` puis redéployer

### Problème 3 : Logs disent "SENTRY_DSN manquant"
→ **Solution** : Forcer un redémarrage avec "Manual Deploy"

---

## ✅ CONFIRMATION FINALE

Une fois que vous voyez dans les logs Render :
```
✅ Sentry initialisé - Monitoring actif
```

C'est bon ! Même si Sentry.io dit "Start Setup" partout, c'est normal car aucune erreur n'est encore arrivée.

**Les "Start Setup" disparaîtront automatiquement dès la première erreur capturée.**
