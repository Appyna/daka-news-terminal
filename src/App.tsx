import React, { useState, useEffect, useMemo } from 'react';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import NewsColumn from './components/NewsColumn';
import Footer from './components/Footer';
import TopBar from '../components/TopBar';
import { PremiumModal } from './components/PremiumModal';
import { useAuth } from './contexts/AuthContext';
import { NewsItem, NewsColumn as NewsColumnType } from './types-old';
import { COLORS } from './constants';
import { getAllNews } from './services/apiService';

const API_BASE_URL = 'https://daka-news-backend.onrender.com/api';

const App: React.FC = () => {
  const { isPremium } = useAuth();
  const [allColumns, setAllColumns] = useState<NewsColumnType[]>([]);
  const [focusedNewsId, setFocusedNewsId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCountry, setCurrentCountry] = useState('Israel');
  const [currentSource, setCurrentSource] = useState('Ynet');
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Détecter le retour du paiement Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Nettoyer l'URL après 5 secondes
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setShowPaymentSuccess(false);
      }, 5000);
    }
  }, []);

  // Détecter le retour du magic link de réinitialisation
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setShowPasswordReset(true);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const loadAllFeeds = async () => {
      try {
        setIsLoading(true);
        
        // ✅ Utiliser getAllNews() avec cache 3min au lieu d'appels multiples
        const newsData = await getAllNews();
        
        if (!newsData.success || !newsData.articles) return;

        // Grouper les articles par source
        const sourceMap = new Map<string, any[]>();
        const sourceColors = new Map<string, string>();
        
        for (const article of newsData.articles) {
          if (!sourceMap.has(article.source)) {
            sourceMap.set(article.source, []);
            sourceColors.set(article.source, article.color);
          }
          sourceMap.get(article.source)!.push(article);
        }

        const newColumns: NewsColumnType[] = [];
        
        for (const [sourceName, articles] of sourceMap.entries()) {
          const items: NewsItem[] = articles.map((article: any) => {
            const pubDate = new Date(article.pub_date);
            const time = `${String(pubDate.getHours()).padStart(2, '0')}:${String(pubDate.getMinutes()).padStart(2, '0')}`;
            
            return {
              id: article.id,
              time,
              title: article.translation || article.title,
              translation: article.title_original,
              source: sourceName,
              priority: article.priority || 'normal',
              color: article.priority === 'high' ? sourceColors.get(sourceName) : '#FFFFFF',
              country: article.country,
              content: article.content || article.title_original,
              tags: [article.country, sourceName],
              pubDate: pubDate.getTime(),
              url: article.link
            };
          });

          items.sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0));
          
          newColumns.push({
            id: `${articles[0].country.toLowerCase()}-${sourceName.toLowerCase().replace(/\s+/g, '-')}`,
            media: `${articles[0].country} - ${sourceName}`,
            backgroundColor: '#1C1940',
            headerColor: sourceColors.get(sourceName) || '#FFFFFF',
            items
          });
        }

        setAllColumns(newColumns);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllFeeds();
    const interval = setInterval(loadAllFeeds, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const visibleColumns = useMemo(() => {
    return allColumns.filter((col) => {
      const matchCountry = col.media.startsWith(currentCountry);
      const matchSource = col.media.includes(currentSource);
      return matchCountry && matchSource;
    });
  }, [allColumns, currentCountry, currentSource]);

  const filteredColumns = useMemo(() => {
    if (!searchQuery) return visibleColumns;
    
    return visibleColumns.map(col => ({
      ...col,
      items: col.items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(col => col.items.length > 0);
  }, [visibleColumns, searchQuery]);

  const handleSelectFlux = (country: string, source: string) => {
    setCurrentCountry(country);
    setCurrentSource(source);
    setMenuOpen(false);
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden" style={{ backgroundColor: COLORS.dark3 }}>
      <TopBar 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentCountry={currentCountry}
        currentSource={currentSource}
        onSelectFlux={handleSelectFlux}
        isPremium={isPremium}
        onPremiumRequired={() => {
          setShowPremiumModal(true);
          setMenuOpen(false);
        }}
      />

      <main className="flex-1 min-h-0 w-full overflow-hidden">
        {/* Message de confirmation paiement */}
        {showPaymentSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div 
              className="px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${COLORS.accentYellow1}, ${COLORS.accentYellow2})`,
                color: COLORS.dark1
              }}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-bold text-base sm:text-lg whitespace-nowrap">
                Bienvenue dans DAKA News Premium
              </p>
            </div>
          </div>
        )}

        {filteredColumns.length === 0 ? (
          <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#1C1940' }}>
            <div className="relative">
              <style>{`
                @keyframes wave {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
                .loading-wave {
                  background: linear-gradient(90deg, 
                    ${COLORS.accentYellow1}40 0%, 
                    ${COLORS.accentYellow1} 50%, 
                    ${COLORS.accentYellow1}40 100%
                  );
                  background-size: 200% 100%;
                  animation: wave 1.5s ease-in-out infinite;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
              `}</style>
              <span className="loading-wave text-base font-semibold">
                {isLoading ? 'Chargement...' : 'Aucun article trouvé'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full overflow-hidden">
            {filteredColumns.map((column) => (
              <NewsColumn 
                key={column.id} 
                column={column} 
                onItemClick={(item) => setFocusedNewsId(prev => prev === item.id ? null : item.id)}
                focusedNewsId={focusedNewsId}
              />
            ))}
          </div>
        )}
      </main>

      <Footer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

export default App;
