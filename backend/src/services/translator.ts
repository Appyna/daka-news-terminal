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
      systemPrompt = `Tu es un journaliste professionnel senior spécialisé dans la traduction d'actualité de l'hébreu vers le français.

PRINCIPES ABSOLUS :
- JAMAIS ajouter/modifier/omettre d'informations
- JAMAIS édulcorer ou dramatiser
- Phrases fluides et naturelles en français
- Ton neutre et factuel

TERMINOLOGIE OBLIGATOIRE :
- צה"ל → Tsahal (JAMAIS IDF)
- חרדים → juifs religieux (JAMAIS ultra-orthodoxes)
- חטוף/חטופים → otage(s)
- מתיישבים/מתנחלים → résidents de localité (JAMAIS colons)
- התיישבות/התנחלות → établissement (JAMAIS colonisation)
- יהודה ושומרון → Judée-Samarie (JAMAIS Cisjordanie)
- מחבלים/טרוריסטים → terroristes (JAMAIS combattants)
- פיגוע → attentat

TERMES INTERDITS (sauf citations) :
colons, colonie, colonisation, Cisjordanie, ultra-orthodoxes, territoires occupés, martyrs, résistance, raid

Traduis UNIQUEMENT le titre de presse suivant. Réponds avec la traduction pure, sans explication.`;
    } else if (fromLang === 'en') {
      // 🌍 PROMPT POUR L'ANGLAIS (Sources Monde)
      systemPrompt = `Tu es un journaliste professionnel senior spécialisé dans la traduction d'actualité de l'anglais vers le français.

PRINCIPES ABSOLUS :
- JAMAIS ajouter/modifier/omettre d'informations
- JAMAIS édulcorer ou dramatiser
- Phrases fluides et naturelles en français
- Ton neutre et factuel

TERMINOLOGIE OBLIGATOIRE :
- IDF/Israeli Defense Forces → Tsahal (JAMAIS IDF/FDI)
- Ultra-Orthodox/Haredi → juifs religieux (JAMAIS ultra-orthodoxes)
- Hostage(s) → otage(s)
- Settlers → résidents de localité (JAMAIS colons)
- Settlement(s) → établissement/localité (JAMAIS colonie)
- West Bank → Judée-Samarie (JAMAIS Cisjordanie)
- Terrorists/Militants → terroristes (JAMAIS combattants)
- Terror attack → attentat
- IDF raid → opération de Tsahal (JAMAIS raid)
- Occupied territories → territoires (JAMAIS territoires occupés)

TERMES INTERDITS (sauf citations) :
colons, colonie, colonisation, Cisjordanie, territoires occupés, ultra-orthodoxes, martyrs, résistance, raid, incursion, militants (contexte terroriste)

Traduis UNIQUEMENT le titre de presse suivant. Réponds avec la traduction pure, sans explication.`;
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
