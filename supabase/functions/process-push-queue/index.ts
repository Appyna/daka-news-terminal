import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  try {
    console.log('🔄 Démarrage du traitement de la queue (multi-jobs)...');

    // 1. Récupérer jusqu'à 5 jobs en parallèle
    const { data: jobs, error: fetchError } = await supabase
      .from('push_notification_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5);

    if (fetchError) throw fetchError;

    // 2. Vérifier les jobs à retry (exponential backoff)
    const { data: retryJobs, error: retryError } = await supabase
      .from('push_notification_jobs')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', 3)
      .lte('next_retry_at', new Date().toISOString())
      .order('next_retry_at', { ascending: true })
      .limit(2);

    if (retryError) throw retryError;

    const allJobs = [...(jobs || []), ...(retryJobs || [])];
    
    if (allJobs.length === 0) {
      console.log('✅ Aucun job en attente');
      return new Response(JSON.stringify({ message: 'No pending jobs' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Traitement de ${allJobs.length} jobs en parallèle`);

    // 3. Traiter tous les jobs en parallèle
    const results = await Promise.allSettled(
      allJobs.map(job => processJob(job, supabase))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ ${successCount} jobs complétés, ${failedCount} échoués`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: allJobs.length,
        successful: successCount,
        failed: failedCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// Fonction pour traiter un job individuel
async function processJob(job: any, supabase: any) {
  console.log(`📋 Job ${job.id}: "${job.title}" (retry: ${job.retry_count})`);

  try {
    // Marquer comme "processing"
    await supabase
      .from('push_notification_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', job.id);

    // Marquer comme "processing"
    await supabase
      .from('push_notification_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', job.id);

    // 3. Récupérer les tokens valides (RPC call)
    const { data: allTokens, error: tokensError } = await supabase.rpc('get_valid_push_tokens', {
      p_user_ids: job.user_ids
    });

    if (tokensError) throw tokensError;

    if (!allTokens || allTokens.length === 0) {
      await supabase
        .from('push_notification_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          error_message: 'Aucun token valide'
        })
        .eq('id', job.id);
      
      console.log('⚠️ Aucun token valide trouvé');
      return { success: true, sent: 0 };
    }

    // Si job chunké, limiter aux tokens de ce chunk
    let tokens = allTokens;
    if (job.error_message && job.error_message.startsWith('Chunk')) {
      const match = job.error_message.match(/Chunk (\d+)\/(\d+)/);
      if (match) {
        const chunkIndex = parseInt(match[1]) - 1;
        const chunkSize = 10000;
        tokens = allTokens.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
        console.log(`📦 Chunk ${match[1]}/${match[2]}: ${tokens.length} tokens`);
      }
    }

    console.log(`📤 Envoi à ${tokens.length} tokens...`);

    // 4. Préparer les messages
    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title: job.title,
      body: job.body,
      badge: 1,
      priority: 'high',
    }));

    // 5. Diviser en chunks de 100
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    console.log(`📦 ${chunks.length} chunks à envoyer`);

    // 6. Envoyer avec rate limiting (max 10 chunks simultanés)
    let successCount = 0;
    let failedCount = 0;
    const invalidTokens: string[] = [];

    const sendChunk = async (chunk: any[], index: number) => {
      try {
        // Délai entre les chunks pour respecter le rate limit Expo
        if (index > 0 && index % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const response = await fetch(EXPO_PUSH_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chunk),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error(`❌ Chunk ${index + 1} erreur HTTP:`, result);
          failedCount += chunk.length;
          return;
        }

        // Vérifier les erreurs individuelles
        if (result.data) {
          for (let i = 0; i < result.data.length; i++) {
            const receipt = result.data[i];
            if (receipt.status === 'error') {
              const errorType = receipt.details?.error;
              // Erreurs Expo qui signifient token invalide
              if (errorType === 'DeviceNotRegistered' || errorType === 'InvalidCredentials') {
                invalidTokens.push(chunk[i].to);
              }
              failedCount++;
            } else {
              successCount++;
            }
          }
        } else {
          successCount += chunk.length;
        }

        console.log(`✅ Chunk ${index + 1}/${chunks.length} traité`);
      } catch (error) {
        console.error(`❌ Chunk ${index + 1} exception:`, error);
        failedCount += chunk.length;
      }
    };

    // Envoyer tous les chunks (avec rate limiting intégré)
    await Promise.all(chunks.map((chunk, index) => sendChunk(chunk, index)));

    console.log(`🎉 Envoi terminé: ${successCount} succès, ${failedCount} échecs`);

    // 7. Nettoyer les tokens invalides
    if (invalidTokens.length > 0) {
      console.log(`🧹 Nettoyage de ${invalidTokens.length} tokens invalides`);
      await supabase.rpc('mark_tokens_invalid', {
        p_tokens: invalidTokens,
        p_error_type: 'DeviceNotRegistered'
      });
    }

    // 8. Marquer le job comme complété
    await supabase
      .from('push_notification_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        tokens_sent: successCount,
        tokens_failed: failedCount
      })
      .eq('id', job.id);

    console.log('✅ Job complété avec succès');
    return { success: true, sent: successCount, failed: failedCount };

  } catch (error) {
    console.error(`❌ Job ${job.id} erreur:`, error);
    
    // Incrémenter retry_count et calculer next_retry_at (exponential backoff)
    const nextRetryCount = (job.retry_count || 0) + 1;
    const backoffMinutes = Math.pow(2, nextRetryCount); // 2, 4, 8 minutes
    const nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

    if (nextRetryCount >= 3) {
      // Déplacer vers dead letter queue après 3 échecs
      await supabase.from('failed_push_jobs').insert({
        id: job.id,
        original_job_id: job.id,
        title: job.title,
        body: job.body,
        user_ids: job.user_ids,
        retry_count: nextRetryCount,
        final_error: error.message
      });

      await supabase
        .from('push_notification_jobs')
        .delete()
        .eq('id', job.id);

      console.log(`💀 Job ${job.id} déplacé vers dead letter queue`);
    } else {
      // Marquer pour retry avec exponential backoff
      await supabase
        .from('push_notification_jobs')
        .update({
          status: 'failed',
          retry_count: nextRetryCount,
          next_retry_at: nextRetryAt.toISOString(),
          error_message: error.message
        })
        .eq('id', job.id);

      console.log(`🔄 Job ${job.id} retentera dans ${backoffMinutes} minutes`);
    }

    throw error;
  }
}
