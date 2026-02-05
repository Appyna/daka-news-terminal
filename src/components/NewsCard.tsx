
import React from 'react';
import { NewsItem } from '../types-old';
import { COLORS } from '../constants';

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
  isFocused?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onClick, isFocused }) => {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${item.title}\n\nSource: ${item.source}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copié dans le presse-papiers !');
    }
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className={`group relative border-b border-white/5 cursor-pointer transition-all duration-300 ${
        isFocused 
          ? 'bg-white/8 px-3.5 py-6' 
          : 'hover:bg-white/5 p-3.5'
      }`}
      style={isFocused ? {
        boxShadow: `0 0 0 0.4px ${COLORS.accentYellow1}`
      } : undefined}
    >
      <div className={`flex justify-between items-start ${isFocused ? 'mb-4' : 'mb-2'}`}>
        <span className="text-[11px] font-mono text-white/40">{item.time}</span>
        <div className="flex items-center gap-3">
          {isFocused && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-white/70 hover:text-white hover:bg-white/10"
              title="Partager"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-xs font-medium">Partager</span>
            </button>
          )}
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{item.source}</span>
        </div>
      </div>
      
      <h3 className={`text-sm font-bold leading-tight transition-colors ${
        isFocused ? 'text-yellow-500 mb-4' : 'text-white'
      }`}>
        {item.title}
      </h3>

      {isFocused && item.translation && item.country !== 'France' && (
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[9px] uppercase tracking-wide text-white/25 mb-1.5">
            TEXTE SOURCE
          </p>
          <p 
            className="text-xs text-white/50 leading-relaxed"
            style={item.country === 'Israel' ? { direction: 'rtl' } : undefined}
          >
            {item.translation}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsCard;
