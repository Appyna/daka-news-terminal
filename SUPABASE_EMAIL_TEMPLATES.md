# 📧 Templates Email DAKA News Terminal

## Configuration dans Supabase Dashboard

**Navigation** : Authentication > Email Templates

---

## 1️⃣ Confirm signup (Code OTP)

**Subject** : `Votre code de vérification DAKA News`

**Body (HTML)** :

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1635 0%, #2d1b69 100%);
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #1a1635 0%, #2d1b69 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .tagline {
      color: #fbbf24;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 8px;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      color: #1a1635;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px 0;
      text-align: center;
    }
    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .code-container {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      margin: 32px 0;
    }
    .code-label {
      color: #1e40af;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .code {
      font-family: 'Courier New', monospace;
      font-size: 48px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 8px;
      margin: 0;
      user-select: all;
    }
    .expiry {
      color: #dc2626;
      font-size: 14px;
      font-weight: 600;
      margin-top: 16px;
    }
    .info-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .info-box p {
      color: #92400e;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      background: #f9fafb;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #6b7280;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .social-links {
      margin-top: 16px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6b7280;
      text-decoration: none;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">DAKA</h1>
      <div class="tagline">News Terminal</div>
    </div>
    
    <div class="content">
      <h1>Bienvenue sur DAKA News ! 🎉</h1>
      <p>Merci de vous inscrire. Pour finaliser la création de votre compte, veuillez entrer le code de vérification ci-dessous :</p>
      
      <div class="code-container">
        <div class="code-label">Votre code de vérification</div>
        <p class="code">{{ .Token }}</p>
        <p class="expiry">⏱️ Expire dans 20 minutes</p>
      </div>
      
      <div class="info-box">
        <p><strong>⚠️ Vous n'avez pas demandé ce code ?</strong><br>
        Ignorez cet email en toute sécurité. Votre compte reste protégé.</p>
      </div>
      
      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
        Une fois vérifié, vous aurez accès à l'actualité mondiale en temps réel, traduite et organisée par pays et source.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>DAKA News Terminal</strong> – L'actualité mondiale, claire et organisée</p>
      <p>Cet email a été envoyé depuis une application propulsée par <a href="https://supabase.com" target="_blank">Supabase</a></p>
      <div class="social-links">
        <a href="https://daka-news.com">Site web</a> •
        <a href="mailto:support@daka-news.com">Support</a> •
        <a href="https://daka-news.com/privacy">Politique de confidentialité</a>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 2️⃣ Reset Password (Lien magique)

**Subject** : `Réinitialisation de votre mot de passe DAKA News`

**Body (HTML)** :

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1635 0%, #2d1b69 100%);
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #1a1635 0%, #2d1b69 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .tagline {
      color: #fbbf24;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 8px;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      color: #1a1635;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px 0;
      text-align: center;
    }
    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 48px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
    .expiry {
      color: #dc2626;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      margin-top: 16px;
    }
    .security-box {
      background: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .security-box p {
      color: #7f1d1d;
      font-size: 14px;
      margin: 0;
    }
    .link-fallback {
      background: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      word-break: break-all;
    }
    .link-fallback p {
      color: #374151;
      font-size: 12px;
      margin: 0 0 8px 0;
    }
    .link-fallback a {
      color: #3b82f6;
      font-size: 12px;
      word-break: break-all;
    }
    .footer {
      background: #f9fafb;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #6b7280;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .social-links {
      margin-top: 16px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6b7280;
      text-decoration: none;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">DAKA</h1>
      <div class="tagline">News Terminal</div>
    </div>
    
    <div class="content">
      <h1>Réinitialisation de mot de passe 🔐</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte DAKA News Terminal.</p>
      <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
      
      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">Réinitialiser mon mot de passe</a>
      </div>
      
      <p class="expiry">⏱️ Ce lien expire dans 1 heure</p>
      
      <div class="security-box">
        <p><strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong><br>
        Ignorez cet email. Votre mot de passe actuel reste inchangé et votre compte est sécurisé.</p>
      </div>
      
      <div class="link-fallback">
        <p><strong>Le bouton ne fonctionne pas ?</strong><br>
        Copiez et collez ce lien dans votre navigateur :</p>
        <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a>
      </div>
      
      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
        💡 <strong>Conseil de sécurité :</strong> Utilisez un mot de passe unique et complexe pour protéger votre compte.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>DAKA News Terminal</strong> – L'actualité mondiale, claire et organisée</p>
      <p>Cet email a été envoyé depuis une application propulsée par <a href="https://supabase.com" target="_blank">Supabase</a></p>
      <div class="social-links">
        <a href="https://daka-news.com">Site web</a> •
        <a href="mailto:support@daka-news.com">Support</a> •
        <a href="https://daka-news.com/privacy">Politique de confidentialité</a>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 📝 Instructions d'application

1. **Aller sur** https://app.supabase.com
2. Sélectionner votre projet
3. **Authentication** → **Email Templates**
4. Cliquer sur **"Confirm signup"**
   - Remplacer le Subject et Body avec le template ci-dessus
   - Sauvegarder
5. Cliquer sur **"Reset Password"**
   - Remplacer le Subject et Body avec le template ci-dessus
   - Sauvegarder

## ✅ Variables Supabase disponibles

- `{{ .Token }}` - Code OTP (inscription)
- `{{ .ConfirmationURL }}` - Lien magique (reset password)
- `{{ .SiteURL }}` - URL de votre site
- `{{ .Email }}` - Email de l'utilisateur

## 🎨 Personnalisation

**Couleurs du branding DAKA :**
- Background principal : `#1a1635` → `#2d1b69` (gradient violet foncé)
- Accent jaune : `#fbbf24`
- Bouton bleu : `#3b82f6` → `#1e40af`
- Texte principal : `#1a1635`

**Après application**, les emails auront :
- ✅ Design moderne avec gradient DAKA
- ✅ Code OTP bien visible et copiable
- ✅ Bouton CTA attractif pour reset password
- ✅ Messages de sécurité clairs
- ✅ Footer professionnel avec liens
- ✅ Mobile-responsive
