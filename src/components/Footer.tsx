
import React from 'react';
import { COLORS } from '../constants';

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
      className="h-14 flex-shrink-0 border-t border-white/5 px-6 flex items-center gap-8 z-20"
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
          placeholder="Rechercher"
          className="bg-transparent border-none outline-none text-xs text-white/80 w-full font-medium"
        />
      </div>

      <div className="flex-1" />

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Live</span>
      </div>
    </footer>
  );
};

export default Footer;
