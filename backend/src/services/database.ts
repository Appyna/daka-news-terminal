import { supabase, Article, Source } from '../config/supabase';

/**
 * Récupérer toutes les sources actives
 */
export async function getActiveSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true });

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
    .select('id')
    .eq('category', category)
    .eq('active', true);

  if (!sources || sources.length === 0) {
    return [];
  }

  const sourceIds = sources.map(s => s.id);

  // ✅ JOIN avec sources pour ajouter le nom de la source
  const { data, error } = await supabase
    .from('articles')
    .select('*, sources(name)')
    .in('source_id', sourceIds)
    .gte('pub_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('pub_date', { ascending: false });

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
 * Nettoyer les articles de plus de 24h
 */
export async function cleanupOldArticles(): Promise<number> {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabase
    .from('articles')
    .delete()
    .lt('pub_date', cutoffDate);

  if (error) {
    console.error('❌ Erreur cleanup articles:', error);
    return 0;
  }

  return count || 0;
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
