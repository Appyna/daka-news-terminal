import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getCachedTranslation, saveCachedTranslation } from './database';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY manquante dans .env');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Traduire un texte (avec cache automatique)
 */
export async function translateText(
  text: string,
  fromLang: string = 'he',
  toLang: string = 'fr'
): Promise<string> {
  // Vérifier le cache d'abord (économise les appels OpenAI)
  const cached = await getCachedTranslation(text, fromLang, toLang);
  if (cached) {
    // console.log(`✅ Cache hit pour: "${text.substring(0, 30)}..."`);
    return cached;
  }

  try {
    // ✅ Prompts spécialisés selon la langue source
    let systemPrompt = '';
    
    if (fromLang === 'he') {
      // 🇮🇱 PROMPT POUR L'HÉBREU (Sources Israël)
      systemPrompt = `Tu es un traducteur spécialisé dans l'actualité israélienne.
Traduis ce titre de presse de l'hébreu vers le français.
- Style: journalistique, accrocheur, concis
- Ton: neutre et factuel
- Contexte: actualités géopolitiques (Israël, Moyen-Orient)
- Format: titre court et percutant (max 15 mots)
Réponds UNIQUEMENT avec la traduction, sans explication.`;
    } else if (fromLang === 'en') {
      // 🌍 PROMPT POUR L'ANGLAIS (Sources Monde)
      systemPrompt = `Tu es un traducteur spécialisé dans l'actualité internationale.
Traduis ce titre de presse de l'anglais vers le français.
- Style: journalistique français (type Le Monde, AFP)
- Ton: neutre, factuel, professionnel
- Format: titre français naturel (max 15 mots)
- Conserve l'impact et l'urgence du titre original
Réponds UNIQUEMENT avec la traduction, sans explication.`;
    } else {
      // 🔄 FALLBACK (autres langues)
      systemPrompt = `Tu es un traducteur professionnel. Traduis le texte suivant de ${fromLang} vers ${toLang}. Réponds UNIQUEMENT avec la traduction, sans aucune explication.`;
    }

    // ✅ Appel OpenAI seulement si pas en cache
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const translation = response.choices[0]?.message?.content?.trim() || text;

    // Sauvegarder dans le cache pour la prochaine fois
    await saveCachedTranslation(text, translation, fromLang, toLang);

    return translation;
  } catch (error: any) {
    // Gérer les erreurs de rate limit spécifiquement
    if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
      console.error('⚠️ Rate limit OpenAI atteint - utilisation de l\'original');
    } else {
      console.error('❌ Erreur traduction OpenAI:', error.message);
    }
    return text; // Fallback: retourner le texte original
  }
}

/**
 * Traduire un batch de textes (avec cache)
 */
export async function translateBatch(
  texts: string[],
  fromLang: string = 'he',
  toLang: string = 'fr'
): Promise<string[]> {
  const translations: string[] = [];

  for (const text of texts) {
    const translation = await translateText(text, fromLang, toLang);
    translations.push(translation);
  }

  return translations;
}

console.log('✅ Service de traduction OpenAI configuré');
