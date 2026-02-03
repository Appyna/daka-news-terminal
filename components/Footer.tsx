
import React from 'react';
import { COLORS } from '../src/constants';

interface FooterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const Footer: React.FC<FooterProps> = ({ 
  searchQuery, 
  setSearchQuery
}) => {
  return (
    <footer 
      className="h-[56px] border-t border-white/5 px-6 flex items-center gap-8 z-20"
      style={{ backgroundColor: COLORS.dark2 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded border border-white/10 group focus-within:border-yellow-500/50 transition-all">
        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un mot-clé..."
          className="bg-transparent border-none outline-none text-xs text-white/80 w-full font-medium"
        />
      </div>

      <div className="flex-1" />

      <div className="text-[10px] text-white/20 font-mono tracking-tighter">
        DAKA News Terminal • v1.0
      </div>
    </footer>
  );
};

export default Footer;
