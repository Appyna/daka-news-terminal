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
    // ✅ Appel OpenAI seulement si pas en cache
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un traducteur professionnel. Traduis le texte suivant de ${fromLang} vers ${toLang}. Réponds UNIQUEMENT avec la traduction, sans aucune explication.`
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
