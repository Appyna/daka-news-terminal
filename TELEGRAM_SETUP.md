# 🚀 Backend Telegram (RSSHub) - DAKA News

## ⚡ Configuration ZÉRO - Fonctionne immédiatement !

Le backend utilise **RSSHub** pour récupérer les messages des **channels Telegram publics**.  
✅ **Aucun bot à créer**  
✅ **Aucun token nécessaire**  
✅ **Fonctionne avec n'importe quel channel public**

## 🎯 Lancer le Backend

**Terminal 1** (Backend Telegram) :
```bash
cd backend
npm run dev
```

**Terminal 2** (Frontend Vite) :
```bash
npm run dev
```

## ✅ Test

- Backend : http://localhost:3001/health
- Arutz 7 : http://localhost:3001/api/telegram/arutz7flashes
- Frontend : http://localhost:3000

## 📱 Channels Telegram supportés

N'importe quel channel **public** Telegram fonctionne :
- `arutz7flashes` - Arutz 7 Flash News
- `kann_news` - Kann News  
- `ynetalerts` - Ynet Alerts
- `hakolhayehudi` - Hakol Hayehudi
- `channel13news` - Channel 13

Format de l'URL : `/api/telegram/NOM_DU_CHANNEL`

## 🔧 Prochaines étapes

1. **Intégrer dans App.tsx** : Appeler `fetchTelegramChannel('arutz7flashes', 'Israel', 'Arutz 7', '#FF6B6B')`
2. **Ajouter d'autres channels** : Même fonction pour tous les channels publics
3. **Traduction automatique** : Le système traduit en français via OpenAI

---

**Avantages RSSHub** :
- ✅ Gratuit et open-source
- ✅ Pas de limite d'API
- ✅ Cache intégré (30 secondes)
- ✅ Fonctionne avec tous les channels publics
