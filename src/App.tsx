import React, { useState, useEffect, useMemo } from 'react';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import NewsColumn from './components/NewsColumn';
import TopBar from '../components/TopBar';
import { NewsItem, NewsColumn as NewsColumnType } from './types-old';
import { COLORS } from './constants';
import { getAllNews } from './services/apiService';

const App: React.FC = () => {
  const [allColumns, setAllColumns] = useState<NewsColumnType[]>([]);
  const [focusedNewsId, setFocusedNewsId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCountry, setCurrentCountry] = useState('Israel');
  const [currentSource, setCurrentSource] = useState('Ynet');
  const [isLoading, setIsLoading] = useState(true);

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
      />

      <main className="flex-1 min-h-0 w-full overflow-hidden">

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
    </div>
  );
};

export default App;
