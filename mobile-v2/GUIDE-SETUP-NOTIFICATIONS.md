# 📱 GUIDE SETUP NOTIFICATIONS PUSH - V2

**Date** : 16 février 2026  
**Système** : Identique v1 (Fonction SQL → Edge Function → Expo Push API)

---

## 📋 ÉTAPE 1 : Créer la fonction SQL dans Supabase

**Aller dans** : Supabase Dashboard → SQL Editor → New Query

**Copier-coller ce code** :

```sql
-- Fonction SQL pour envoyer des notifications push via Supabase Edge Function
CREATE OR REPLACE FUNCTION send_push_notification(
  p_title TEXT,
  p_body TEXT,
  p_user_ids UUID[] DEFAULT NULL,
  p_article_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens TEXT[];
  v_response JSON;
  v_edge_function_url TEXT;
BEGIN
  -- Récupérer les tokens push selon les critères
  IF p_user_ids IS NULL THEN
    -- Envoyer à tous les users
    SELECT ARRAY_AGG(DISTINCT push_token)
    INTO v_tokens
    FROM user_push_tokens
    WHERE push_token IS NOT NULL
      AND push_token LIKE 'ExponentPushToken%';
  ELSE
    -- Envoyer uniquement aux users spécifiés
    SELECT ARRAY_AGG(DISTINCT push_token)
    INTO v_tokens
    FROM user_push_tokens
    WHERE user_id = ANY(p_user_ids)
      AND push_token IS NOT NULL
      AND push_token LIKE 'ExponentPushToken%';
  END IF;

  -- Si aucun token trouvé
  IF v_tokens IS NULL OR array_length(v_tokens, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Aucun token trouvé',
      'sent', 0
    );
  END IF;

  -- URL de l'edge function
  v_edge_function_url := current_setting('app.settings', true)::json->>'supabase_url' || '/functions/v1/send-push-notification';
  
  -- Appeler l'edge function
  SELECT content::json INTO v_response
  FROM http((
    'POST',
    v_edge_function_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || current_setting('app.settings', true)::json->>'service_role_key')
    ],
    'application/json',
    jsonb_build_object(
      'title', p_title,
      'body', p_body,
      'tokens', v_tokens
    )::text
  )::http_request);

  RETURN v_response;
END;
$$;

-- Fonction pour envoyer uniquement aux users premium
CREATE OR REPLACE FUNCTION send_push_notification_to_premium(
  p_title TEXT,
  p_body TEXT,
  p_article_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_premium_user_ids UUID[];
BEGIN
  -- Récupérer les IDs des users premium
  SELECT ARRAY_AGG(id)
  INTO v_premium_user_ids
  FROM profiles
  WHERE is_premium = true;

  -- Appeler la fonction principale
  RETURN send_push_notification(p_title, p_body, v_premium_user_ids, p_article_id);
END;
$$;

COMMENT ON FUNCTION send_push_notification IS 'Envoie une notification push via Expo Push API';
COMMENT ON FUNCTION send_push_notification_to_premium IS 'Envoie une notification push à tous les users premium';
```

**Cliquer** : Run (F5)

---

## 📋 ÉTAPE 2 : Activer l'extension pg_net (si pas déjà fait)

**Dans** : Supabase Dashboard → SQL Editor → New Query

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

**Cliquer** : Run

---

## 📋 ÉTAPE 3 : Créer l'Edge Function Supabase

**Option A : Via Supabase CLI (recommandé)**

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Créer la fonction
supabase functions new send-push-notification

# Remplacer le contenu de supabase/functions/send-push-notification/index.ts par :
```

**Code Edge Function (index.ts)** :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const { title, body, tokens } = await req.json();

    if (!title || !body || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'title, body et tokens (array) requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Envoi de ${tokens.length} notifications: "${title}"`);

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      badge: 1,
      priority: 'high',
    }));

    // Batching 100 messages max par appel Expo
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    console.log(`📦 ${chunks.length} chunks de 100 messages max`);

    const sendChunk = async (chunk: any[], index: number) => {
      try {
        const response = await fetch(EXPO_PUSH_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chunk),
        });
        
        const result = await response.json();
        console.log(`✅ Chunk ${index + 1}/${chunks.length} envoyé`);
        return { success: true, data: result };
      } catch (error: any) {
        console.error(`❌ Erreur chunk ${index + 1}:`, error);
        return { success: false, error: error.message };
      }
    };

    const results = await Promise.all(
      chunks.map((chunk, index) => sendChunk(chunk, index))
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`🎉 ${successCount}/${chunks.length} chunks envoyés avec succès`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: messages.length,
        chunks: chunks.length,
        successfulChunks: successCount,
        results 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('❌ Erreur globale:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Déployer** :

```bash
supabase functions deploy send-push-notification
```

---

**Option B : Via Dashboard Supabase (si CLI ne marche pas)**

1. Aller dans : **Edge Functions** → **Create a new function**
2. Nom : `send-push-notification`
3. Copier-coller le code TypeScript ci-dessus
4. Deploy

---

## 📋 ÉTAPE 4 : Tester

**Dans Supabase SQL Editor** :

```sql
-- Test 1 : Envoyer à tous les users
SELECT send_push_notification(
  '🔔 Test DAKA News', 
  'Si tu vois ça, les notifications marchent !',
  NULL  -- NULL = tous les users
);

-- Test 2 : Envoyer uniquement aux premium
SELECT send_push_notification_to_premium(
  '⭐ Notification Premium', 
  'Contenu exclusif disponible'
);

-- Test 3 : Envoyer à un user spécifique (remplacer l'UUID)
SELECT send_push_notification(
  '👋 Test perso', 
  'Message pour toi uniquement',
  ARRAY['ton-user-id-ici']::UUID[]
);
```

---

## 📊 Vérifications

**1. Vérifier que les tokens sont enregistrés** :

```sql
SELECT 
  device_id,
  LEFT(push_token, 30) || '...' as token,
  user_id,
  updated_at
FROM user_push_tokens
ORDER BY updated_at DESC
LIMIT 10;
```

**2. Voir les logs Edge Function** :

Supabase Dashboard → Edge Functions → send-push-notification → Logs

---

## 💡 Usage quotidien

**Envoyer une breaking news à tous** :

```sql
SELECT send_push_notification(
  '🚨 Breaking News', 
  'Titre de l article important',
  NULL
);
```

**Envoyer uniquement aux premium** :

```sql
SELECT send_push_notification_to_premium(
  '⭐ Nouveau contenu', 
  'Nouvelle source ajoutée'
);
```

---

## 🔧 Troubleshooting

**Erreur "aucun token trouvé"** :
- Vérifie que l'app mobile a enregistré des tokens dans `user_push_tokens`
- Les tokens doivent commencer par `ExponentPushToken`

**Erreur "edge function not found"** :
- Vérifie que l'edge function est déployée : `supabase functions list`
- Vérifie l'URL dans la fonction SQL

**Notifications n'arrivent pas** :
- Vérifie les logs Edge Function (Dashboard → Functions → Logs)
- Vérifie que les permissions iOS sont accordées dans l'app
- Test avec l'outil Expo : https://expo.dev/notifications

---

## ✅ Checklist finale

- [ ] Extension pg_net activée
- [ ] Fonction SQL `send_push_notification()` créée
- [ ] Edge Function `send-push-notification` déployée
- [ ] Test SQL envoyé avec succès
- [ ] Notification reçue sur iPhone

**Une fois tout coché → Système 100% opérationnel comme v1** 🎉
