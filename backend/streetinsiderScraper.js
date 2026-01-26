import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Créer et ajouter le plugin stealth
const stealth = StealthPlugin();
chromium.use(stealth);

/**
 * Scrape StreetInsider Reuters avec Playwright + Stealth
 */
export async function scrapeStreetInsider() {
  let browser;
  try {
    console.log('[StreetInsider] Lancement du navigateur...');
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    const page = await context.newPage();
    
    console.log('[StreetInsider] Navigation vers la page Reuters...');
    await page.goto('https://www.streetinsider.com/Reuters', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Attendre que le contenu soit chargé
    await page.waitForSelector('table', { timeout: 10000 });

    // Screenshot pour debug
    const screenshotPath = '/Users/nicolaslpa/Desktop/DAKA NEWS TERMINAL/backend/streetinsider-debug.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[StreetInsider] Screenshot sauvegardé: ${screenshotPath}`);

    // Debug: afficher le HTML
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('[StreetInsider] HTML Length:', bodyHTML.length);
    console.log('[StreetInsider] Sample HTML:', bodyHTML.substring(0, 500));

    console.log('[StreetInsider] Extraction des articles...');
    
    const articles = await page.evaluate(() => {
      const items = [];
      
      // Cibler spécifiquement la table des news (pas les graphiques de marché)
      const newsTables = document.querySelectorAll('table[width="100%"]');
      
      for (const table of newsTables) {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
          // Chercher le lien du titre dans la cellule
          const titleLink = row.querySelector('td a[href*="/news/"], td a[href*="/article/"]');
          
          // Exclure les liens vers les graphiques et indices boursiers
          if (titleLink && 
              !titleLink.href.includes('javascript:') && 
              !titleLink.href.includes('quote?Symbol') &&
              !titleLink.href.includes('switchchart') &&
              titleLink.textContent.trim().length > 15) {
            
            const title = titleLink.textContent.trim();
            const link = titleLink.href;
            
            // Chercher l'heure dans la même ligne
            const timeCells = row.querySelectorAll('td');
            let time = new Date().toLocaleTimeString();
            
            for (const cell of timeCells) {
              const text = cell.textContent.trim();
              // Pattern pour détecter les heures (ex: "4:54 PM", "12:30 AM")
              if (text.match(/\d{1,2}:\d{2}\s?(AM|PM)/i)) {
                time = text;
                break;
              }
            }
            
            items.push({
              title,
              link,
              time,
              pubDate: Date.now()
            });
          }
        });
      }
      
      return items;
    });

    console.log(`[StreetInsider] ${articles.length} articles extraits`);
    
    await browser.close();
    return articles;

  } catch (error) {
    console.error('[StreetInsider] Erreur:', error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}
