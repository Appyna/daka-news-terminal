
import React from 'react';
import { COLORS } from '../constants';
import Logo from './Logo';

const TopBar: React.FC = () => {
  return (
    <header 
      className="h-[64px] border-b border-white/5 flex items-center justify-between px-6 z-20"
      style={{ backgroundColor: COLORS.dark2 }}
    >
      <Logo />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Live</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
