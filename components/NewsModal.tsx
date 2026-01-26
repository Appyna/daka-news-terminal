
import React from 'react';
import { NewsItem } from '../types';
import { COLORS } from '../constants';

interface NewsModalProps {
  item: NewsItem;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ item, onClose }) => {
  // AI Analysis désactivé par défaut - nécessite configuration API key
  const aiAnalysis = null;
  const loading = false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-white/10"
        style={{ backgroundColor: COLORS.dark2 }}
      >
        {/* Header */}
        <div className="sticky top-0 p-4 border-b border-white/10 flex justify-between items-center z-10" style={{ backgroundColor: COLORS.dark2 }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/40">{item.time}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ backgroundColor: COLORS.accentYellow1, color: COLORS.dark2 }}>
              {item.source}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const shareText = `${item.title}\n\n${item.content}`;
                if (navigator.share) {
                  navigator.share({ title: item.title, text: shareText });
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert('Copié dans le presse-papiers !');
                }
              }}
              className="text-white/40 hover:text-white transition-colors"
              title="Partager"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-lg md:text-xl font-extrabold mb-6 leading-tight" style={{ color: COLORS.accentYellow1 }}>
            {item.title}
          </h2>

          <div className="prose prose-invert max-w-none text-white/70 leading-relaxed text-base">
            {item.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
