# DAKA Telegram Backend

Backend Node.js pour récupérer les flux Telegram et les exposer en API REST.

## Installation

```bash
cd backend
npm install
```

## Configuration du Bot Telegram

### 1. Créer un bot Telegram

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Choisissez un nom : `DAKA News Bot`
4. Choisissez un username : `daka_news_bot` (doit finir par `_bot`)
5. **Copiez le token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Ajouter le bot au channel

1. Ouvrez le channel Telegram (ex: @arutz7flashes)
2. Cliquez sur le nom du channel → Administrateurs
3. Ajoutez votre bot comme administrateur
4. Donnez-lui la permission "Lire les messages"

### 3. Configurer le backend

Dans `backend/.env`, ajoutez :
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
PORT=3001
```

## Lancement

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3001

## Endpoints

- `GET /health` - Vérifier le statut
- `GET /api/telegram/:channel` - Récupérer les messages d'un channel
  - Exemple: `http://localhost:3001/api/telegram/arutz7flashes`

## Utilisation dans le front-end

Le front-end appelle : `/api/telegram/arutz7flashes` via le proxy Vite
