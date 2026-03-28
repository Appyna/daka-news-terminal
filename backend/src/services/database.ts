import { supabase, Article, Source } from '../config/supabase';

/**
 * Récupérer toutes les sources actives
 */
export async function getActiveSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('active', true)
    .order('category_order', { ascending: true })
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Erreur récupération sources:', error);
    throw error;
  }

  return data || [];
}

/**
 * Récupérer tous les articles d'une source (24h max)
 */
export async function getArticlesBySource(sourceName: string): Promise<Article[]> {
  // Récupérer l'ID de la source
  const { data: sourceData } = await supabase
    .from('sources')
    .select('id')
    .eq('name', sourceName)
    .single();

  if (!sourceData) {
    return [];
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('source_id', sourceData.id)
    .gte('pub_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('pub_date', { ascending: false });

  if (error) {
    console.error(`❌ Erreur récupération articles ${sourceName}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer tous les articles par catégorie (avec le nom de la source)
 */
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const { data: sources } = await supabase
    .from('sources')
    .select('id, retention_days')
    .eq('category', category)
    .eq('active', true);

  if (!sources || sources.length === 0) {
    return [];
  }

  const sourceIds = sources.map(s => s.id);

  // Utiliser la rétention maximale de la catégorie comme fenêtre de requête
  // Ex: si Aplus a 7 jours, on cherche 7 jours pour tout Israël
  // Les autres sources n'ont pas d'articles > 48h (nettoyés par le cron)
  const maxRetention = Math.max(...sources.map(s => s.retention_days || 1));
  const cutoff = new Date(Date.now() - maxRetention * 24 * 60 * 60 * 1000).toISOString();

  // ✅ JOIN avec sources pour ajouter le nom de la source
  // limit(5000) : évite la limite par défaut Supabase de 1000 lignes
  const { data, error} = await supabase
    .from('articles')
    .select('*, sources(name)')
    .in('source_id', sourceIds)
    .gte('pub_date', cutoff)
    .order('pub_date', { ascending: false })
    .limit(5000);

  if (error) {
    console.error(`❌ Erreur récupération articles ${category}:`, error);
    return [];
  }

  // Flatten le résultat pour ajouter source.name comme 'source'
  return (data || []).map((article: any) => ({
    ...article,
    source: article.sources?.name || 'Unknown'
  }));
}

/**
 * Vérifier si un article existe déjà (pour éviter traduction inutile)
 */
export async function articleExists(sourceId: string, link: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('source_id', sourceId)
    .eq('link', link)
    .single();

  return !error && data !== null;
}

/**
 * Insérer ou mettre à jour un article (upsert via link unique)
 */
export async function upsertArticle(article: Omit<Article, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('articles')
    .upsert(
      {
        ...article,
        pub_date: new Date(article.pub_date).toISOString()
      },
      {
        onConflict: 'source_id,link',
        ignoreDuplicates: false
      }
    );

  if (error) {
    console.error('❌ Erreur upsert article:', error.message);
    return false;
  }

  return true;
}

/**
 * Nettoyer les anciens articles en respectant la rétention par source
 * (rétention_days * 2 pour garder une marge de sécurité)
 */
export async function cleanupOldArticles(): Promise<number> {
  // Récupérer toutes les sources avec leur rétention
  const { data: sources } = await supabase
    .from('sources')
    .select('id, retention_days');

  if (!sources || sources.length === 0) return 0;

  // Grouper les sources par nombre de jours de rétention
  const groups = new Map<number, number[]>();
  for (const s of sources) {
    const days = s.retention_days || 1;
    if (!groups.has(days)) groups.set(days, []);
    groups.get(days)!.push(s.id);
  }

  let totalDeleted = 0;
  for (const [days, ids] of groups) {
    // On garde 2x la rétention (ex: 48h pour 1 jour, 14 jours pour 7 jours)
    const cutoff = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error: deleteError } = await supabase
      .from('articles')
      .delete({ count: 'exact' })
      .in('source_id', ids)
      .lt('pub_date', cutoff);
    if (!deleteError) totalDeleted += count || 0;
  }

  return totalDeleted;
}

/**
 * Récupérer une traduction du cache
 */
export async function getCachedTranslation(
  originalText: string,
  fromLang: string = 'he',
  toLang: string = 'fr'
): Promise<string | null> {
  const { data } = await supabase
    .from('translations_cache')
    .select('translated_text')
    .eq('original_text', originalText)
    .eq('from_lang', fromLang)
    .eq('to_lang', toLang)
    .single();

  return data?.translated_text || null;
}

/**
 * Sauvegarder une traduction dans le cache
 */
export async function saveCachedTranslation(
  originalText: string,
  translatedText: string,
  fromLang: string = 'he',
  toLang: string = 'fr'
): Promise<void> {
  await supabase
    .from('translations_cache')
    .upsert(
      {
        original_text: originalText,
        translated_text: translatedText,
        from_lang: fromLang,
        to_lang: toLang
      },
      {
        onConflict: 'original_text,from_lang,to_lang',
        ignoreDuplicates: false
      }
    );
}
