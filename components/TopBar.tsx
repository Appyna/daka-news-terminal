import React, { useState } from 'react';
import { COLORS } from '../src/constants';
import Logo from './Logo';
import Sidebar from './Sidebar';

interface TopBarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  currentCountry: string;
  currentSource: string;
  onSelectFlux: (country: string, source: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  menuOpen, 
  setMenuOpen, 
  currentCountry, 
  currentSource, 
  onSelectFlux 
}) => {
  return (
    <header 
      className="h-[64px] border-b border-white/5 flex items-center justify-between px-6 z-20"
      style={{ backgroundColor: COLORS.dark2 }}
    >
      {/* Menu hamburger flux/sources en haut à gauche */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 hover:bg-white/5 rounded-md transition-colors"
        aria-label="Menu des sources"
      >
        <svg className="w-6 h-6" style={{ color: COLORS.accentYellow1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Logo />

      {/* Sidebar pour les flux/sources */}
      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentCountry={currentCountry}
        currentSource={currentSource}
        onSelectFlux={onSelectFlux}
      />
    </header>
  );
};

export default TopBar;

