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

    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    console.log(`📦 ${chunks.length} chunks de 100 messages max`);

    const sendChunk = async (chunk, index) => {
      try {
        const response = await fetch(EXPO_PUSH_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chunk),
        });
        
        const result = await response.json();
        console.log(`✅ Chunk ${index + 1}/${chunks.length} envoyé`);
        return { success: true, data: result };
      } catch (error) {
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
  } catch (error) {
    console.error('❌ Erreur globale:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
