# 🔍 DEBUG NOTIFICATIONS ANDROID - Build 42

## ✅ ÉTAPE 1 : Vérifier la base de données

### Va sur Supabase :
1. **Ouvre** : https://supabase.com/dashboard/project/twziblzgpkqiitqpmjws/editor
2. **Clique** sur la table `user_push_tokens` (à gauche)
3. **Regarde** les lignes :
   - Cherche une ligne avec `platform = 'android'`
   - Vérifie qu'il y a un `push_token` qui commence par `ExponentPushToken[...]`

### ❓ Que vois-tu ?

**A) J'ai une ligne avec platform = 'android'**
→ Le token est enregistré ✅
→ Passe à ÉTAPE 2 (tester l'envoi)

**B) Je n'ai AUCUNE ligne avec platform = 'android'**  
→ Le token n'a PAS été créé ❌
→ Passe à ÉTAPE 3 (voir les logs)

**C) J'ai seulement platform = 'ios'**
→ Même chose que B, le token Android n'existe pas
→ Passe à ÉTAPE 3

---

## ✅ ÉTAPE 2 : Tester l'envoi de notification (SI ÉTAPE 1 = A)

### Dans l'éditeur SQL Supabase :
1. **Clique** sur "SQL Editor" (à gauche)
2. **Colle** cette requête :

```sql
SELECT send_push_notification(
  'TEST ANDROID' :: text,
  'Message de test depuis Supabase' :: text,
  NULL :: uuid
);
```

3. **Clique** sur "Run" (en haut à droite)
4. **Regarde** ton téléphone Android

### ❓ Que se passe-t-il ?

**A) J'ai reçu la notification sur Android** 🎉
→ PROBLÈME RÉSOLU !

**B) Je n'ai RIEN reçu sur Android**
→ Le token existe mais les notifications ne marchent pas
→ Passe à ÉTAPE 3

---

## ✅ ÉTAPE 3 : Récupérer les logs de l'app Android

### Méthode SIMPLE (sans câble) :

#### Sur ton téléphone Android :
1. **Ouvre** l'app DAKA News
2. **Secoue** le téléphone plusieurs fois → Menu développeur s'ouvre
3. **Clique** sur "Show Dev Menu" ou "Debug"
4. **Cherche** ces messages dans les logs :

```
🚀 App démarrage - enregistrement notifications...
🎯 Token push reçu: OUI ou NON
💾 Sauvegarde token pour device: ...
✅ Token sauvegardé avec succès
```

### ❓ Que vois-tu dans les logs ?

**A) Je ne vois PAS de menu développeur quand je secoue**
→ L'app est en mode production (normal pour Build 42)
→ On doit builder une version DEBUG (Build 43)

**B) Je vois : "🎯 Token push reçu: NON"**
→ Le téléphone ne peut PAS générer de token Expo
→ Problème : Google Play Services manquant ou Project ID incorrect

**C) Je vois : "🎯 Token push reçu: OUI" + "✅ Token sauvegardé"**
→ Tout devrait marcher MAIS vérifie ÉTAPE 1 pour confirmer

**D) Je vois : "❌ Erreur..." quelque part**
→ **COPIE-COLLE** le message d'erreur complet et envoie-le moi

---

## 🎯 COMMENCE PAR ÉTAPE 1 MAINTENANT

**Dis-moi ce que tu vois dans Supabase table `user_push_tokens`**
