import React, { useState, useEffect, useMemo } from 'react';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import NewsColumn from './components/NewsColumn';
import Footer from './components/Footer';
import NewsModal from './components/NewsModal';
import TopBar from '../components/TopBar';
import { PremiumModal } from './components/PremiumModal';
import { useAuth } from './contexts/AuthContext';
import { NewsItem, NewsColumn as NewsColumnType } from './types-old';
import { COLORS } from './constants';

const API_BASE_URL = 'https://daka-news-backend.onrender.com/api';

const App: React.FC = () => {
  const { isPremium } = useAuth();
  const [allColumns, setAllColumns] = useState<NewsColumnType[]>([]);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
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
        
        const sourcesRes = await fetch(`${API_BASE_URL}/sources`);
        const sourcesData = await sourcesRes.json();
        
        if (!sourcesData.success) return;

        const newColumns: NewsColumnType[] = [];
        
        for (const [category, sources] of Object.entries(sourcesData.sources) as Array<[string, any[]]>) {
          for (const sourceInfo of sources) {
            try {
              const feedRes = await fetch(`${API_BASE_URL}/feeds/${encodeURIComponent(sourceInfo.name)}`);
              const feedData = await feedRes.json();
              
              if (feedData.success && feedData.articles) {
                const items: NewsItem[] = feedData.articles.map((article: any) => {
                  const pubDate = new Date(article.pub_date);
                  const time = `${String(pubDate.getHours()).padStart(2, '0')}:${String(pubDate.getMinutes()).padStart(2, '0')}`;
                  
                  return {
                    id: article.id,
                    time,
                    title: article.translation || article.title,
                    translation: article.title_original,
                    source: sourceInfo.name,
                    priority: article.priority || 'normal',
                    color: article.priority === 'high' ? sourceInfo.color : '#FFFFFF',
                    country: category,
                    content: article.content || article.title_original,
                    tags: [category, sourceInfo.name],
                    pubDate: pubDate.getTime()
                  };
                });

                items.sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0));
                
                newColumns.push({
                  id: `${category.toLowerCase()}-${sourceInfo.name.toLowerCase().replace(/\s+/g, '-')}`,
                  media: `${category} - ${sourceInfo.name}`,
                  backgroundColor: '#1C1940',
                  headerColor: sourceInfo.color,
                  items
                });
              }
            } catch (error) {
              console.error(`Erreur ${sourceInfo.name}:`, error);
            }
          }
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
      <TopBar />
      
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 text-2xl font-medium px-3 py-2.5 rounded-r-lg"
        style={{ 
          color: COLORS.accentYellow1,
          backgroundColor: '#221C45',
          boxShadow: `0.5px 0 0 0 ${COLORS.accentYellow1}80, 0 0.5px 0 0 ${COLORS.accentYellow1}80, 0 -0.5px 0 0 ${COLORS.accentYellow1}80`
        }}
        aria-label="Ouvrir le menu"
      >
        ☰
      </button>

      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
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
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-bold">Paiement réussi</p>
                <p className="text-sm">Bienvenue dans DAKA News Premium</p>
              </div>
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
              <NewsColumn key={column.id} column={column} onItemClick={setSelectedNewsItem} />
            ))}
          </div>
        )}
      </main>

      <Footer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {selectedNewsItem && (
        <NewsModal 
          item={selectedNewsItem} 
          onClose={() => setSelectedNewsItem(null)} 
        />
      )}
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

export default App;
