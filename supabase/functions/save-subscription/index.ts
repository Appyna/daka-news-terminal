import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Récupérer le token d'auth de l'user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Client Supabase avec SERVICE ROLE (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Client normal pour vérifier l'auth de l'user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Vérifier que l'user est authentifié
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données de subscription
    const { subscriptionData, profileData } = await req.json();

    if (!subscriptionData || !profileData) {
      return new Response(
        JSON.stringify({ error: 'subscriptionData et profileData requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`💾 Saving subscription for user ${user.id}`);

    // Vérifier que l'user ne modifie que SES données
    if (subscriptionData.user_id !== user.id || profileData.id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // UPSERT profile (avec admin client = bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erreur profile', details: profileError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // INSERT subscription (avec admin client = bypass RLS)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData);

    if (subError) {
      console.error('❌ Subscription error:', subError);
      return new Response(
        JSON.stringify({ error: 'Erreur subscription', details: subError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Subscription saved successfully');

    return new Response(
      JSON.stringify({ success: true }),
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
