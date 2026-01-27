
import React from 'react';
import { NewsColumn as NewsColumnType, NewsItem } from '../types-old';
import NewsCard from './NewsCard';

interface NewsColumnProps {
  column: NewsColumnType;
  onItemClick: (item: NewsItem) => void;
}

const NewsColumn: React.FC<NewsColumnProps> = ({ column, onItemClick }) => {
  // Skeleton loader si pas d'items
  const isLoading = column.items.length === 0;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div 
        className="p-3.5 font-extrabold text-sm uppercase tracking-wider border-b border-white/20 flex-shrink-0"
        style={{ color: '#F5C518' }}
      >
        {column.media}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {isLoading ? (
          // Skeleton loader professionnel
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-3.5 border-b border-white/5 animate-pulse">
                <div className="flex items-start gap-2">
                  <div className="h-3 w-12 bg-white/10 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full"></div>
                    <div className="h-3 bg-white/10 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          column.items.map((item) => (
            <NewsCard key={item.id} item={item} onClick={onItemClick} />
          ))
        )}
      </div>
    </div>
  );
};

export default NewsColumn;
