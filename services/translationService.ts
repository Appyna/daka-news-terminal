// Utilisation de OpenAI API (gpt-4o-mini) avec cache
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// Cache des traductions en localStorage
const TRANSLATION_CACHE_KEY = 'daka_translations_cache';

function getCachedTranslation(text: string): string | null {
  try {
    const cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
    return cache[text] || null;
  } catch {
    return null;
  }
}

function setCachedTranslation(text: string, translation: string): void {
  try {
    const cache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
    cache[text] = translation;
    // Limiter la taille du cache à 1000 entrées
    const entries = Object.entries(cache);
    if (entries.length > 1000) {
      const limitedCache = Object.fromEntries(entries.slice(-1000));
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(limitedCache));
    } else {
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('Erreur cache:', error);
  }
}

export async function translateToFrench(text: string): Promise<string> {
  // Vérifier le cache d'abord
  const cached = getCachedTranslation(text);
  if (cached) {
    return cached;
  }

  if (!OPENAI_API_KEY) {
    return text;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un traducteur expert hébreu-français spécialisé en actualités. Traduis uniquement le texte, sans commentaire.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim() || text;
    
    // Mettre en cache
    setCachedTranslation(text, translation);
    
    return translation;
  } catch (error) {
    console.error('Erreur de traduction:', error);
    return text;
  }
}

export async function translateBatch(texts: string[]): Promise<string[]> {
  // Séparer les textes déjà en cache de ceux à traduire
  const toTranslate: { index: number; text: string }[] = [];
  const results: string[] = new Array(texts.length);

  texts.forEach((text, index) => {
    const cached = getCachedTranslation(text);
    if (cached) {
      results[index] = cached;
    } else {
      toTranslate.push({ index, text });
    }
  });

  // Si tout est en cache, retourner directement
  if (toTranslate.length === 0) {
    return results;
  }

  if (!OPENAI_API_KEY) {
    toTranslate.forEach(({ index, text }) => {
      results[index] = text;
    });
    return results;
  }

  try {
    const textsToTranslate = toTranslate.map(t => t.text);
    
    // Retry avec délai en cas de rate limit
    let attempts = 0;
    let response: Response | null = null;
    
    while (attempts < 3) {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un traducteur expert hébreu-français spécialisé en actualités. Traduis chaque titre en français, un par ligne, dans le même ordre.'
            },
            {
              role: 'user',
              content: textsToTranslate.map((t, i) => `${i + 1}. ${t}`).join('\n')
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });
      
      // Si rate limit (429), attendre et réessayer
      if (response.status === 429 && attempts < 2) {
        console.warn(`Rate limit OpenAI, attente ${(attempts + 1) * 2}s...`);
        await new Promise(resolve => setTimeout(resolve, (attempts + 1) * 2000));
        attempts++;
        continue;
      }
      
      break;
    }

    if (!response || !response.ok) {
      console.error(`OpenAI API error: ${response?.status}`);
      toTranslate.forEach(({ index, text }) => {
        results[index] = text;
      });
      return results;
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    
    if (translated) {
      const translations = translated.split('\n').map(t => t.replace(/^\d+\.\s*/, '').trim());
      
      toTranslate.forEach(({ index, text }, i) => {
        const translation = translations[i] || text;
        results[index] = translation;
        setCachedTranslation(text, translation);
      });
    } else {
      toTranslate.forEach(({ index, text }) => {
        results[index] = text;
      });
    }
    
    return results;
  } catch (error) {
    console.error('Erreur de traduction batch:', error);
    toTranslate.forEach(({ index, text }) => {
      results[index] = text;
    });
    return results;
  }
}
