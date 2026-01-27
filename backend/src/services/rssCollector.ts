import { parseStringPromise } from 'xml2js';
import { Source, Article } from '../config/supabase';
import { translateText } from './translator';
import { upsertArticle, articleExists } from './database';

/**
 * Fetch et parser un flux RSS
 */
async function fetchAndParseRSS(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const result = await parseStringPromise(xmlText);

    // Extraire les items (compatible RSS 2.0 et Atom)
    const items = result.rss?.channel?.[0]?.item || result.feed?.entry || [];
    return items;
  } catch (error: any) {
    console.error(`❌ Erreur fetch RSS ${url}:`, error.message);
    return [];
  }
}

/**
 * Nettoyer le HTML et entités
 */
function cleanText(text: string | any): string {
  if (!text) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\[CDATA\[|\]\]/g, '')
    .trim();
}

/**
 * Parser une date RSS (compatible différents formats)
 */
function parseRSSDate(dateString: string | undefined): Date {
  if (!dateString) {
    return new Date();
  }

  // Extraire le contenu si wrapped dans CDATA
  const cleaned = dateString.replace(/\[CDATA\[|\]\]/g, '').trim();
  const date = new Date(cleaned);

  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Collecter et stocker les articles d'une source
 */
export async function collectSourceArticles(source: Source): Promise<number> {
  console.log(`📡 Collecte: ${source.name} (${source.category})`);

  const items = await fetchAndParseRSS(source.rss_url);

  if (items.length === 0) {
    console.log(`⚠️  Aucun article trouvé pour ${source.name}`);
    return 0;
  }

  let newArticlesCount = 0;
  let skippedOld = 0;
  let skippedDuplicates = 0;
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;

  console.log(`📊 ${source.name}: ${items.length} articles dans le flux RSS`);

  // Collecter les 15 PREMIERS articles seulement (au lieu de TOUS)
  const articlesToProcess = items.slice(0, 15);
  
  for (let i = 0; i < articlesToProcess.length; i++) {
    const item = articlesToProcess[i];

    // Extraire les données (compatible RSS 2.0 et Atom)
    const title = cleanText(
      item.title?.[0]?._ || item.title?.[0] || item.title || 'Sans titre'
    );
    const link = item.link?.[0]?._ || item.link?.[0] || item.link || '';
    const pubDateStr = item.pubDate?.[0]?._ || item.pubDate?.[0] || item.pubDate || item.published?.[0];
    const description = cleanText(
      item.description?.[0]?._ || item.description?.[0] || item.description || item.summary?.[0] || ''
    );

    if (!link || !title) {
      continue;
    }

    const pubDate = parseRSSDate(pubDateStr);

    // Filtrer articles >24h
    if (pubDate.getTime() < cutoffTime) {
      skippedOld++;
      continue;
    }

    // Vérifier si l'article existe déjà (éviter traduction inutile)
    const exists = await articleExists(source.id, link);
    if (exists) {
      skippedDuplicates++;
      continue; // Article déjà en base, pas de traduction
    }

    // Traduction automatique (OpenAI gpt-4o-mini) - seulement pour nouveaux articles
    let translation = title;
    if (!source.skip_translation) {
      // Détection automatique de la langue source
      const sourceLang = source.category === 'Israel' ? 'he' : 'en';
      try {
        // Timeout de 5 secondes pour la traduction
        translation = await Promise.race([
          translateText(title, sourceLang, 'fr'),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
      } catch (error) {
        console.log(`⚠️ Traduction timeout/erreur pour "${title.substring(0, 40)}..." - utilisation de l'original`);
        translation = title; // Fallback sur le titre original
      }
    }

    // Préparer l'article
    const article: Omit<Article, 'id' | 'created_at'> = {
      source_id: source.id,
      title: translation, // Titre traduit
      title_original: title, // Titre original
      translation: translation, // Titre traduit (pour frontend)
      content: description.substring(0, 500),
      link,
      pub_date: pubDate.toISOString(),
      priority: i < 3 ? 'high' : 'normal',
      color: i < 3 ? source.color : '#FFFFFF',
      country: source.category
    };

    // Upsert dans la base (déduplique via source_id + link)
    const success = await upsertArticle(article);
    if (success) {
      newArticlesCount++;
    }
  }

  console.log(`✅ ${source.name}: ${newArticlesCount} nouveaux | ${skippedDuplicates} déjà en base | ${skippedOld} trop anciens`);
  return newArticlesCount;
}

/**
 * Collecter tous les flux actifs
 */
export async function collectAllSources(sources: Source[]): Promise<void> {
  console.log(`\n🚀 Collecte de ${sources.length} sources...`);

  const startTime = Date.now();

  // Collecter en parallèle par catégorie (éviter surcharge OpenAI)
  const israelSources = sources.filter(s => s.category === 'Israel');
  const franceSources = sources.filter(s => s.category === 'France');
  const mondeSources = sources.filter(s => s.category === 'Monde');

  // Israel
  for (const source of israelSources) {
    await collectSourceArticles(source);
  }

  // France
  for (const source of franceSources) {
    await collectSourceArticles(source);
  }

  // Monde
  for (const source of mondeSources) {
    await collectSourceArticles(source);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Collecte terminée en ${duration}s\n`);
}
