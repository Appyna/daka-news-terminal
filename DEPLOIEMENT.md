# 🚀 GUIDE DÉPLOIEMENT DAKA NEWS TERMINAL
## (Expliqué pour les non-développeurs)

---

## 📌 C'EST QUOI LE DÉPLOIEMENT ?

Actuellement, ton site fonctionne **uniquement sur ton ordinateur** (localhost:3000).  
Le déploiement = **mettre ton site sur Internet** pour y accéder de n'importe où, 24h/24.

On va mettre:
- **Le backend** (serveur qui collecte les articles) → sur **Railway** (gratuit)
- **Le frontend** (interface que tu vois) → sur **Vercel** (gratuit)

**Durée totale: 20-30 minutes**

---

## 🎯 ÉTAPE 0: AVANT DE COMMENCER

### ✅ **Vérifie que tu as:**
1. Un compte **Gmail** ou **Email** (pour t'inscrire)
2. Ton projet fonctionne sur localhost:3000 ✅
3. Ta clé OpenAI (tu l'as déjà) ✅

### 📝 **Crée ces 3 comptes (GRATUIT):**
1. **GitHub.com** → Stocke ton code (comme Google Drive pour le code)
2. **Railway.app** → Héberge le backend (serveur)
3. **Vercel.com** → Héberge le frontend (site web)

**→ Inscris-toi sur ces 3 sites AVANT de continuer.**

---

## 📦 PARTIE 1: METTRE TON CODE SUR GITHUB

### **Pourquoi?**
GitHub = "Dropbox pour développeurs". Railway et Vercel vont lire ton code depuis là.

### **1.1 - Créer un compte GitHub**
1. Va sur **https://github.com**
2. Clique **Sign up** (Inscription)
3. Utilise ton email, crée un mot de passe
4. Vérifie ton email

### **1.2 - Créer un "repository" (dossier en ligne)**
1. Une fois connecté, clique le **+** en haut à droite
2. Clique **New repository**
3. Nom: `daka-news-terminal`
4. Laisse **Public** coché
5. **NE COCHE PAS** "Add a README file"
6. Clique **Create repository**

### **1.3 - Envoyer ton code sur GitHub**

**DANS TON TERMINAL MAC** (celui où tu lances le serveur):

```bash
# 1. Va dans le dossier du projet
cd "/Users/nicolaslpa/Desktop/DAKA NEWS TERMINAL"

# 2. Connecte ton dossier à GitHub (REMPLACE "TON_USERNAME" par ton nom d'utilisateur GitHub)
git remote add origin https://github.com/TON_USERNAME/daka-news-terminal.git

# 3. Envoie le code sur GitHub
git push -u origin master
```

**Si ça demande un mot de passe:**
- Username: ton pseudo GitHub
- Password: va sur GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → Coche "repo" → Génère → Copie le token → Colle-le comme mot de passe

**✅ VÉRIFICATION:** Va sur `https://github.com/TON_USERNAME/daka-news-terminal` → tu dois voir tous tes fichiers

---

## 🚂 PARTIE 2: DÉPLOYER LE BACKEND SUR RAILWAY

### **Pourquoi Railway?**
Railway = ordinateur dans le cloud qui fera tourner ton serveur 24h/24 (gratuit 500h/mois = ~20 jours non-stop).

### **2.1 - Créer un compte Railway**
1. Va sur **https://railway.app**
2. Clique **Login** en haut à droite
3. Clique **Login with GitHub** (plus simple)
4. Autorise Railway à accéder à ton GitHub

### **2.2 - Créer un nouveau projet**
1. Sur Railway, clique **New Project** (gros bouton violet)
2. Clique **Deploy from GitHub repo**
3. Si c'est la première fois, clique **Configure GitHub App**
4. Sélectionne ton compte → **Only select repositories** → Choisis `daka-news-terminal` → **Save**
5. Retourne sur Railway → Clique **Deploy from GitHub repo** → Choisis `daka-news-terminal`

Railway va:
- Lire ton code
- Installer automatiquement les dépendances
- **Attendre 2-3 minutes que ça démarre** ⏳

### **2.3 - Configurer les "Variables d'environnement"**

**C'est quoi?** Des codes secrets que Railway doit connaître pour que ton serveur fonctionne.

**DANS RAILWAY:**
1. Clique sur ton projet `daka-news-terminal`
2. Clique sur **Variables** (dans le menu de gauche)
3. Clique **+ New Variable** et ajoute **UNE PAR UNE** ces variables:

**Variable 1:**
- Name: `PORT`
- Value: `4000`

**Variable 2:**
- Name: `NODE_ENV`
- Value: `production`

**Variable 3:**
- Name: `SUPABASE_URL`
- Value: `https://wzqhrothppyktowwllkr.supabase.co`

**Variable 4:**
- Name: `SUPABASE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWhyb3RocHB5a3Rvd3dsbGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDg5MzYsImV4cCI6MjA4NDk4NDkzNn0.R9LIdoi2uYWDLfEKICKmzUZPmutUq0RtfHGOLJHVf9c`

**Variable 5:**
- Name: `OPENAI_API_KEY`
- Value: **TA CLÉ OPENAI** (commence par `sk-proj-...`)

**Variable 6:**
- Name: `RSS_FETCH_INTERVAL_SECONDS`
- Value: `180`

4. Railway va **redémarrer automatiquement** après chaque variable

### **2.4 - Récupérer l'URL de ton backend**

1. Dans Railway, clique sur **Settings** (en bas à gauche)
2. Clique sur **Generate Domain** (dans la section Networking)
3. Railway génère une URL type: `https://daka-news-terminal-production.up.railway.app`

**📝 COPIE CETTE URL QUELQUE PART** (Notes, fichier texte) → tu en auras besoin pour Vercel

### **2.5 - Tester que ça marche**

Ouvre dans ton navigateur:
```
https://TON_URL_RAILWAY.up.railway.app/api/sources
```

**Tu dois voir du texte JSON avec tes 16 sources de news.**

✅ **Si ça affiche du texte avec "Ynet", "Le Monde", etc. → C'EST BON!**  
❌ **Si erreur 502/503 → Attends 2 minutes (démarrage en cours)**

---

## 🌐 PARTIE 3: DÉPLOYER LE FRONTEND SUR VERCEL

### **Pourquoi Vercel?**
Vercel = héberge ton site web (la partie visuelle) gratuitement, avec un nom de domaine automatique.

### **3.1 - Créer un compte Vercel**
1. Va sur **https://vercel.com**
2. Clique **Sign Up**
3. Clique **Continue with GitHub** (plus simple)
4. Autorise Vercel à accéder à ton GitHub

### **3.2 - Importer ton projet**
1. Sur Vercel, clique **Add New...** → **Project**
2. Trouve `daka-news-terminal` dans la liste
3. Clique **Import**

### **3.3 - Configurer le projet**

**AVANT DE CLIQUER "DEPLOY":**

1. Clique sur **Environment Variables** (en bas)
2. Ajoute cette variable:
   - Name: `VITE_API_URL`
   - Value: `https://TON_URL_RAILWAY.up.railway.app/api` **(REMPLACE par TON URL Railway de l'étape 2.4)**
3. Clique **Add**

4. **Maintenant clique sur le gros bouton bleu "Deploy"**

⏳ **Attends 2-3 minutes** que Vercel construise ton site

### **3.4 - Récupérer l'URL de ton site**

Une fois terminé (icône ✅ verte):
1. Vercel affiche une URL type: `https://daka-news-terminal.vercel.app`
2. Clique sur cette URL → **TON SITE EST EN LIGNE!** 🎉

---

## ✅ VÉRIFICATION FINALE

### **Teste ces 2 URLs dans ton navigateur:**

1. **Backend (Railway):**  
   `https://TON_URL_RAILWAY.up.railway.app/api/sources`  
   → Doit afficher du JSON avec tes sources

2. **Frontend (Vercel):**  
   `https://daka-news-terminal.vercel.app`  
   → Doit afficher ton site avec les articles traduits

**🎉 SI LES DEUX FONCTIONNENT → C'EST TERMINÉ!**

---

## 🔄 COMMENT FAIRE DES MODIFICATIONS APRÈS?

### **Si tu changes du code:**

```bash
# 1. Va dans ton dossier
cd "/Users/nicolaslpa/Desktop/DAKA NEWS TERMINAL"

# 2. Sauvegarde tes changements
git add .
git commit -m "Description de ce que tu as changé"
git push
```

**Railway et Vercel vont automatiquement redéployer** (2-3 minutes).

---

## 💰 C'EST VRAIMENT GRATUIT?

**OUI**, avec ces limites:

| Service | Gratuit | Limite |
|---------|---------|--------|
| **Railway** | ✅ Oui | 500 heures/mois (~20 jours non-stop) |
| **Vercel** | ✅ Oui | Illimité pour les projets perso |
| **Supabase** | ✅ Oui | 500 MB de données |
| **OpenAI** | ❌ Payant | $0.15-$5/mois selon usage |

**Total estimé: $0-5/mois** (juste OpenAI)

Si Railway arrive à 500h, il s'arrête jusqu'au mois suivant → passe à **Railway Pro** ($5/mois pour 100 heures de plus).

---

## ❓ PROBLÈMES COURANTS

### **1. "Le site ne charge pas les articles"**
→ Vérifie dans Vercel → Settings → Environment Variables → `VITE_API_URL` est bien définie avec `/api` à la fin

### **2. "502 Bad Gateway sur Railway"**
→ Attends 2 minutes (démarrage en cours)  
→ Vérifie Railway → Logs → s'il y a des erreurs rouges

### **3. "Git demande un mot de passe et ça ne marche pas"**
→ N'utilise PAS ton mot de passe GitHub  
→ Crée un **Personal Access Token** (voir étape 1.3)

### **4. "Je veux un vrai nom de domaine (genre dakanews.com)"**
1. Achète un domaine sur **Namecheap** (~$10/an)
2. Dans Vercel → Settings → Domains → Ajoute ton domaine
3. Suis les instructions DNS

---

## 📞 BESOIN D'AIDE?

Si tu bloques:
1. **Railway**: Railway Dashboard → Logs (en bas) → copie les erreurs
2. **Vercel**: Vercel Dashboard → Deployments → Clique sur le dernier → Function Logs
3. **GitHub**: Vérifie que ton code est bien uploadé sur github.com/TON_USERNAME/daka-news-terminal

---

**🎉 FÉLICITATIONS! Ton site est maintenant accessible depuis n'importe où dans le monde!**
