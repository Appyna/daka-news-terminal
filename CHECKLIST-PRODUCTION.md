# ✅ CHECKLIST MISE EN PRODUCTION - DAKA News Terminal

## 🔥 ÉTAPE 1 : TRADUCTIONS (MAINTENANT - 5 min)

### Action 1.1 : Ajouter paiement OpenAI
- [ ] Aller sur https://platform.openai.com/account/billing
- [ ] Cliquer "Add payment method"
- [ ] Ajouter carte bancaire
- [ ] Créditer minimum $5 (suffisant pour 1-2 mois)
- [ ] Vérifier que Rate Limits passent de 3 req/min → 500 req/min

### Action 1.2 : Redémarrer le backend
```bash
cd "/Users/nicolaslpa/Desktop/DAKA NEWS TERMINAL/backend"
npm run dev
```

### Action 1.3 : Vérifier que ça marche
- [ ] Attendre 3 minutes (prochain cycle CRON)
- [ ] Ouvrir http://localhost:3000
- [ ] Vérifier qu'articles Ynet affichent traduction française
- [ ] Check terminal backend : pas d'erreur "429 rate limit"

**Résultat attendu :** Articles hébreux traduits en français automatiquement ✨

---

## 🚀 ÉTAPE 2 : DÉPLOIEMENT BACKEND (30 min)

### Option A : Railway (RECOMMANDÉ)

#### 2.1 Créer compte Railway
- [ ] Aller sur https://railway.app
- [ ] Sign up avec GitHub
- [ ] Connecter repo GitHub (ou créer nouveau projet)

#### 2.2 Push code sur GitHub
```bash
cd "/Users/nicolaslpa/Desktop/DAKA NEWS TERMINAL"
git init
git add .
git commit -m "Initial commit - Backend + Frontend ready"
git remote add origin https://github.com/TON_USERNAME/daka-news-terminal.git
git push -u origin main
```

#### 2.3 Déployer sur Railway
- [ ] Dans Railway : New Project → Deploy from GitHub repo
- [ ] Sélectionner le repo daka-news-terminal
- [ ] Aller dans Settings → Root Directory → Set to "backend"
- [ ] Variables d'environnement à ajouter :
  ```
  SUPABASE_URL=https://wzqhrothppyktowwllkr.supabase.co
  SUPABASE_ANON_KEY=[ta clé anon]
  SUPABASE_SERVICE_ROLE_KEY=[ta clé service]
  OPENAI_API_KEY=[ta clé OpenAI]
  PORT=4000
  RSS_FETCH_INTERVAL_SECONDS=180
  ```
- [ ] Deploy → Attendre 2-3 minutes
- [ ] Copier l'URL publique (ex: https://daka-backend-production.up.railway.app)

#### 2.4 Tester le backend en prod
```bash
curl https://TON_URL_RAILWAY/api/sources | jq
```

**Résultat attendu :** Backend accessible publiquement avec HTTPS 🎉

---

## 🌐 ÉTAPE 3 : DÉPLOIEMENT FRONTEND (15 min)

### 3.1 Configurer Vercel
- [ ] Aller sur https://vercel.com
- [ ] Sign up avec GitHub
- [ ] New Project → Import ton repo GitHub

### 3.2 Configuration Vercel
- [ ] Root Directory : laisser `.` (racine)
- [ ] Framework Preset : Vite
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `dist`
- [ ] Environment Variables :
  ```
  VITE_API_URL=https://TON_URL_RAILWAY
  ```

### 3.3 Deploy
- [ ] Cliquer Deploy
- [ ] Attendre 2 minutes
- [ ] Copier l'URL (ex: https://daka-news-terminal.vercel.app)

### 3.4 Tester le frontend
- [ ] Ouvrir l'URL Vercel dans le navigateur
- [ ] Vérifier que les sources chargent
- [ ] Cliquer sur une source → articles s'affichent
- [ ] Menu hamburger fonctionne
- [ ] Recherche fonctionne

**Résultat attendu :** Site web accessible publiquement ! 🎊

---

## 🌍 ÉTAPE 4 : DOMAINE CUSTOM (Optionnel - 1h)

### 4.1 Acheter domaine
- [ ] Aller sur Namecheap/OVH/Google Domains
- [ ] Chercher dakanews.com (ou variante)
- [ ] Acheter (~10€/an)

### 4.2 Configurer DNS
Dans ton registrar :
- [ ] Ajouter record A : `@` → IP de Vercel (voir Vercel docs)
- [ ] Ajouter record CNAME : `www` → `cname.vercel-dns.com`
- [ ] Ajouter record CNAME : `api` → `TON_URL_RAILWAY`

### 4.3 Ajouter domaine à Vercel
- [ ] Dans Vercel → Project Settings → Domains
- [ ] Add Domain : dakanews.com
- [ ] Attendre propagation DNS (5 min - 24h)

**Résultat attendu :** https://dakanews.com fonctionne 🎯

---

## 📊 ÉTAPE 5 : MONITORING (30 min)

### 5.1 Ajouter Sentry (erreurs)
```bash
cd backend
npm install @sentry/node
```

Dans src/server.ts (après imports) :
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: "TON_DSN_SENTRY",
  environment: process.env.NODE_ENV || 'development',
});
```

### 5.2 Check santé backend
Créer endpoint /health :
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});
```

### 5.3 UptimeRobot
- [ ] Créer compte sur https://uptimerobot.com
- [ ] Ajouter monitor : https://TON_URL_RAILWAY/health
- [ ] Interval : 5 minutes
- [ ] Email alert si down

**Résultat attendu :** Alerté si le backend tombe 🔔

---

## 🎯 ÉTAPE 6 : TESTS FINAUX (15 min)

### Tests à faire
- [ ] Ouvrir site sur desktop Chrome
- [ ] Ouvrir site sur mobile Safari
- [ ] Tester toutes les sources Israel (6)
- [ ] Tester toutes les sources France (3)
- [ ] Tester toutes les sources Monde (9)
- [ ] Vérifier traductions françaises
- [ ] Menu hamburger responsive
- [ ] Recherche fonctionne
- [ ] Modal article s'ouvre
- [ ] Refresh auto toutes les 3 min

### Checklist qualité
- [ ] Aucune erreur console navigateur
- [ ] Aucune erreur logs backend
- [ ] Temps de chargement < 2 secondes
- [ ] Design identique desktop/mobile
- [ ] Toutes les 17 sources actives collectent

**Résultat attendu :** App production-ready 100% fonctionnelle ✅

---

## 📝 NOTES

**Coûts mensuels actuels :**
- Supabase : Gratuit (500MB)
- Railway backend : ~$10/mois
- Vercel frontend : Gratuit
- OpenAI traductions : ~$2/mois
- **TOTAL : ~$12/mois**

**Prochaines étapes :**
1. Authentification + Stripe (Phase 2)
2. Admin panel (Phase 3)
3. Apps iOS/Android (Phase 4)

**Liens importants :**
- Backend Railway : [À remplir après deploy]
- Frontend Vercel : [À remplir après deploy]
- Supabase Dashboard : https://supabase.com/dashboard
- OpenAI Usage : https://platform.openai.com/usage

---

🎉 **Bravo ! Une fois ces étapes terminées, DAKA News Terminal sera LIVE !**
