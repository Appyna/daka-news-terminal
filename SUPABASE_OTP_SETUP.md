# Configuration Supabase pour OTP (Code de vérification)

## ⚙️ À activer dans Supabase Dashboard

### 1. Activer Email OTP
1. Va sur https://app.supabase.com
2. Sélectionne ton projet
3. **Authentication** > **Settings**
4. Trouve la section **"Auth Providers"** > **Email**
5. ✅ Active **"Enable Email OTP"**

### 2. Configurer la confirmation email
Dans la même page **Authentication** > **Settings** :
- ✅ **Enable email confirmations** : ON
- Durée d'expiration OTP : **600 secondes** (10 minutes)

### 3. Personnaliser le template email (optionnel mais recommandé)
**Authentication** > **Email Templates** > **Confirm signup**

Remplace le contenu par :
```html
<h2>Bienvenue sur DAKA News Terminal !</h2>
<p>Votre code de vérification :</p>
<h1 style="font-size: 48px; letter-spacing: 10px; font-family: monospace;">{{ .Token }}</h1>
<p>Ce code expire dans 10 minutes.</p>
<p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
```

### 4. Vérifier la configuration SMTP
**Settings** > **Auth** > **SMTP Settings**
- Par défaut, Supabase utilise son propre serveur SMTP
- Pour production, configure ton propre SMTP (SendGrid, Mailgun, etc.)

## ✅ C'est tout !

Une fois activé :
1. User s'inscrit avec email + password + username
2. User reçoit email avec code à 6 chiffres : `123456`
3. User entre le code dans l'app
4. Compte activé instantanément

## 🧪 Test
1. Lance `npm run dev`
2. Clique "Se connecter" > "Inscription"
3. Remplis le formulaire
4. Tu verras "📧 Code de vérification envoyé !"
5. Vérifie ton email
6. Entre le code à 6 chiffres
7. ✅ Compte activé !
