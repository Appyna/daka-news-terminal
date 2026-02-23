/**
 * RÈGLES DE POST-TRAITEMENT - Scripts OpenAI adaptés en Regex
 * 
 * Basé sur les scripts professionnels backend/src/services/translator.ts
 * - Script Israël : Hébreu → Français (235 lignes de règles)
 * - Script Monde : Anglais → Français (330 lignes de règles)
 */

// ═══════════════════════════════════════════════════════════════
// CATÉGORIE ISRAËL - Règles Hébreu → Français
// ═══════════════════════════════════════════════════════════════

const ISRAEL_TERMINOLOGY: Record<string, string> = {
  // Entités militaires
  '\\bIDF\\b': 'Tsahal',
  '\\bIsraeli Defense Forces\\b': 'Tsahal',
  '\\bצה"ל\\b': 'Tsahal',
  
  // Terminologie conflit
  '\\bחטופים\\b': 'otages',
  '\\bחטוף\\b': 'otage',
  '\\bkidnappé\\b': 'otage',
  '\\benlevé\\b': 'otage',
  '\\bcaptif\\b': 'otage',
  
  // Populations
  '\\bחרדים\\b': 'juifs religieux',
  '\\bultra-orthodoxes\\b': 'juifs religieux',
  
  // Territoires
  '\\bמתיישבים\\b': 'résidents de localité',
  '\\bמתנחלים\\b': 'résidents de localité',
  '\\bcolons\\b': 'résidents de localité',
  '\\bהתיישבות\\b': 'établissement',
  '\\bהתנחלות\\b': 'établissement',
  '\\bcolonisation\\b': 'établissement',
  '\\bimplantation\\b': 'établissement',
  '\\bמושב\\b': 'moshav',
  '\\bישובים\\b': 'localités',
  '\\bcolonies\\b': 'localités',
  '\\bיהודה ושומרון\\b': 'Judée-Samarie',
  '\\bCisjordanie\\b': 'Judée-Samarie',
  '\\bWest Bank\\b': 'Judée-Samarie',
  '\\bterritoires occupés\\b': 'territoires',
  '\\bהשטחים\\b': 'territoires',
  
  // Acteurs
  '\\bמחבלים\\b': 'terroristes',
  '\\bטרוריסטים\\b': 'terroristes',
  '\\bcombattants\\b': 'terroristes',
  '\\bmilitants armés\\b': 'terroristes',
  '\\bפיגוע\\b': 'attentat',
  '\\battaque terroriste\\b': 'attentat',
  '\\bincident\\b': 'attentat',
  '\\bערבים ישראלים\\b': 'citoyens arabes israéliens',
  '\\bArabes israéliens\\b': 'citoyens arabes israéliens',
  
  // Institutions
  '\\bרבנות\\b': 'Rabbinat',
  '\\brabbinerie\\b': 'Rabbinat',
  '\\bרבנות הראשית\\b': 'Grand Rabbinat',
  
  // Actions militaires
  '\\bהסיפוח\\b': 'agrandissement',
  '\\bannexion\\b': 'agrandissement',
  '\\braid\\b': 'opération',
  '\\bincursion\\b': 'opération',
};

const ISRAEL_STYLE_RULES: Record<string, string> = {
  // Style journalistique
  '\\ba dit que\\b': 'a déclaré que',
  '\\ba dit\\b': 'a déclaré',
  '\\ba affirmé que\\b': 'a déclaré que',
  '\\ba affirmé\\b': 'a déclaré',
  '\\ba indiqué que\\b': 'a déclaré que',
  '\\ba indiqué\\b': 'a déclaré',
  
  // Actions de tir (contexte passif)
  '\\bqui a été tiré\\b': 'qui a été touché par balle',
  '\\bqui a été abattu\\b': 'qui a été touché par balle',
  '\\bqui a reçu des coups de feu\\b': 'qui a été touché par balle',
  
  // Articles avec noms propres militaires
  "\\bl'Tsahal\\b": 'Tsahal',
  "\\ble Tsahal\\b": 'Tsahal',
  "\\bl'Hamas\\b": 'le Hamas',
  "\\ble Hamas\\b": 'le Hamas',
  "\\bl'Hezbollah\\b": 'le Hezbollah',
};

// ═══════════════════════════════════════════════════════════════
// CATÉGORIE MONDE - Règles Anglais → Français
// ═══════════════════════════════════════════════════════════════

const MONDE_TERMINOLOGY: Record<string, string> = {
  // Entités militaires
  '\\bIDF\\b': 'Tsahal',
  '\\bIsraeli Defense Forces\\b': 'Tsahal',
  '\\bFDI\\b': 'Tsahal',
  
  // Terminologie conflit
  '\\bhostages?\\b': 'otages',
  '\\babductees?\\b': 'otages',
  '\\bcaptives?\\b': 'otages',
  '\\bkidnapped\\b': 'otages',
  
  // Populations
  '\\bUltra-Orthodox\\b': 'juifs religieux',
  '\\bHaredi\\b': 'juifs religieux',
  '\\bHaredim\\b': 'juifs religieux',
  
  // Territoires
  '\\bsettlers\\b': 'résidents de localité',
  '\\bsettlements?\\b': 'établissements',
  '\\bsettlement activity\\b': 'établissement',
  '\\bsettling\\b': 'établissement',
  '\\bWest Bank\\b': 'Judée-Samarie',
  '\\bOccupied West Bank\\b': 'Judée-Samarie',
  '\\boccupied territories\\b': 'territoires',
  '\\boccupation\\b': 'contrôle',
  
  // Acteurs
  '\\bterrorists?\\b': 'terroristes',
  '\\bmilitants?\\b': 'terroristes',
  '\\bPalestinian militants\\b': 'terroristes palestiniens',
  '\\bterror attack\\b': 'attentat',
  '\\bterrorist attack\\b': 'attentat',
  '\\bmartyrs\\b': 'assaillants éliminés',
  '\\bIsraeli Arabs\\b': 'citoyens arabes israéliens',
  '\\bArab Israelis\\b': 'citoyens arabes israéliens',
  '\\bresistance\\b': 'terrorisme',
  
  // Institutions
  '\\bChief Rabbinate\\b': 'Grand Rabbinat',
  '\\bRabbinate\\b': 'Rabbinat',
  '\\bPalestinian Authority\\b': 'Autorité palestinienne',
  
  // Actions militaires
  '\\bannexation\\b': 'agrandissement',
  '\\bIDF raid\\b': 'opération de Tsahal',
  '\\bIsraeli raid\\b': 'opération israélienne',
  '\\bIDF incursion\\b': 'opération de Tsahal',
  '\\braids?\\b': 'opérations',
  '\\bincursions?\\b': 'opérations',
  '\\bairstrikes?\\b': 'frappes aériennes',
  
  // Actions de tir
  '\\bwas shot\\b': 'a été touché par balle',
  '\\bgot shot\\b': 'a été touché par balle',
  '\\bbeen shot\\b': 'a été touché par balle',
  '\\bshot dead\\b': 'tué par balle',
  '\\bshot and killed\\b': 'tué par balle',
  
  // Zones
  '\\bGaza Strip\\b': 'bande de Gaza',
};

const MONDE_STYLE_RULES: Record<string, string> = {
  // Style journalistique
  '\\bsaid that\\b': 'a déclaré que',
  '\\bsaid\\b': 'a déclaré',
  '\\bstated that\\b': 'a déclaré que',
  '\\bstated\\b': 'a déclaré',
  '\\baffirmed that\\b': 'a déclaré que',
  '\\bindicated that\\b': 'a déclaré que',
  
  // Faux-amis anglais
  '\\bActually\\b': 'En réalité',
  '\\bactually\\b': 'en fait',
  '\\bEventually\\b': 'Finalement',
  '\\beventually\\b': 'à terme',
  '\\bsympathetic\\b': 'compatissant',
  '\\binjured\\b': 'blessés',
  
  // Articles avec noms propres
  "\\bthe IDF\\b": 'Tsahal',
  "\\bThe IDF\\b": 'Tsahal',
  "\\bthe Hamas\\b": 'le Hamas',
  "\\bThe Hamas\\b": 'Le Hamas',
  "\\bthe Hezbollah\\b": 'le Hezbollah',
};

// ═══════════════════════════════════════════════════════════════
// RÈGLES COMMUNES (typographie française)
// ═══════════════════════════════════════════════════════════════

const COMMON_TYPOGRAPHY: Record<string, string> = {
  // Guillemets français (noter: clés échappées pour éviter conflits)
  '\u0022': '\u00AB ', // " → «
  '\u201D': ' \u00BB', // " → »
  
  // Espaces insécables avant ponctuations doubles
  '\\s+:': ' :',
  '\\s+;': ' ;',
  '\\s+!': ' !',
  '\\s+\\?': ' ?',
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS D'APPLICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Applique les règles de terminologie et style pour catégorie Israël
 */
export function applyIsraelRules(text: string): string {
  let result = text;
  
  // 1. Terminologie obligatoire (ordre important : termes spécifiques avant génériques)
  Object.entries(ISRAEL_TERMINOLOGY).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi');
    result = result.replace(regex, replacement);
  });
  
  // 2. Règles de style journalistique
  Object.entries(ISRAEL_STYLE_RULES).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi');
    result = result.replace(regex, replacement);
  });
  
  // 3. Typographie française
  Object.entries(COMMON_TYPOGRAPHY).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'g');
    result = result.replace(regex, replacement);
  });
  
  // 4. Nettoyage espaces multiples
  result = result.replace(/\s{2,}/g, ' ').trim();
  
  return result;
}

/**
 * Applique les règles de terminologie et style pour catégorie Monde
 */
export function applyMondeRules(text: string): string {
  let result = text;
  
  // 1. Terminologie obligatoire
  Object.entries(MONDE_TERMINOLOGY).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi');
    result = result.replace(regex, replacement);
  });
  
  // 2. Règles de style journalistique
  Object.entries(MONDE_STYLE_RULES).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi');
    result = result.replace(regex, replacement);
  });
  
  // 3. Typographie française
  Object.entries(COMMON_TYPOGRAPHY).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'g');
    result = result.replace(regex, replacement);
  });
  
  // 4. Nettoyage espaces multiples
  result = result.replace(/\s{2,}/g, ' ').trim();
  
  return result;
}

/**
 * Sélectionne et applique les bonnes règles selon la catégorie
 */
export function applyTranslationRules(text: string, category: 'Israel' | 'Monde'): string {
  if (category === 'Israel') {
    return applyIsraelRules(text);
  } else if (category === 'Monde') {
    return applyMondeRules(text);
  }
  return text;
}
