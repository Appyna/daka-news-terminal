
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

  const isRTL = item.country === 'Israel';

  return (
    <div 
      onClick={() => onClick(item)}
      className={`group relative border-b border-white/5 cursor-pointer transition-all duration-300 ${
        isFocused 
          ? 'bg-white/[0.03] px-3.5 py-6' 
          : 'hover:bg-white/5 p-3.5'
      }`}
      style={isFocused ? {
        boxShadow: `0 0 0 0.4px ${COLORS.accentYellow1}`
      } : undefined}
    >
      {/* Header: time + source */}
      <div className={`flex justify-between items-start ${isFocused ? 'mb-4' : 'mb-2'}`}>
        <span className="text-[11px] font-mono text-white/40">{item.time}</span>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{item.source}</span>
      </div>
      
      {/* Titre */}
      <h3 className={`text-sm font-bold leading-tight transition-colors ${
        isFocused ? 'text-yellow-500 mb-4' : 'text-white'
      }`}>
        {item.title}
      </h3>

      {/* Texte source (si focusé et pas France) */}
      {isFocused && item.translation && item.country !== 'France' && (
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[9px] uppercase tracking-wide text-white/25 mb-1.5">
            TEXTE SOURCE
          </p>
          <p 
            className="text-xs text-white/50 leading-relaxed"
            style={isRTL ? { direction: 'rtl', textAlign: 'right' } : undefined}
          >
            {item.translation}
          </p>
        </div>
      )}

      {/* Boutons d'action (si focusé) */}
      {isFocused && (
        <div className="mt-5 flex items-center gap-2.5">
          {item.url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md transition-colors font-semibold"
              style={{
                backgroundColor: COLORS.accentYellow1,
                color: COLORS.dark1
              }}
              title="Voir l'article d'origine"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-xs font-semibold">Voir l'article d'origine</span>
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md transition-colors border border-white/20 font-semibold"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: COLORS.white
            }}
            title="Partager"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs font-semibold">Partager</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsCard;
