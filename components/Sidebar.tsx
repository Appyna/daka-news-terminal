
import React, { useState } from 'react';
import { COLORS } from '../src/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountry: string;
  currentSource: string;
  onSelectFlux: (country: string, source: string) => void;
}

const fluxByCountry = {
  "Israel": [
    "Arutz 7", "Arutz 14", "Israel Hayom", "Walla", "Ynet"
  ],
  "France": [
    "BFM TV", "France Info", "Le Monde"
  ],
  "Monde": [
    "Reuters", "ANADOLU (Agence de presse turque)", "BBC World", "Bloomberg", "FOXNews", "New York Times", "POLITICO", "RT - Russie", "TASS (Agence de presse russe)"
  ]
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentCountry, currentSource, onSelectFlux }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Menu latéral */}
      <div 
        className={`fixed left-0 top-0 h-full w-[300px] z-50 flex flex-col transition-transform duration-300 shadow-2xl border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: COLORS.dark2 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">Sources</h2>
            <p className="text-[10px] text-white/40 mt-0.5">Sélectionner un flux</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {Object.entries(fluxByCountry).map(([country, sources]) => {
            const countryColor = "#F5C518";
            
            return (
              <div key={country} className="mb-3">
                <div className="px-3 py-2 flex items-center gap-2">
                  <div 
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: countryColor }}
                  />
                  <span 
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: countryColor }}
                  >
                    {country}
                  </span>
                </div>

                <div className="ml-4 space-y-0.5">
                  {sources.map((source) => {
                    const isActive = currentCountry === country && currentSource === source;
                    return (
                      <button
                        key={source}
                        onClick={() => onSelectFlux(country, source)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all text-xs flex items-center gap-2 ${
                          isActive 
                            ? 'bg-yellow-500/15 text-yellow-500 font-semibold border-l-2 border-yellow-500' 
                            : 'hover:bg-white/5 text-white/60 hover:text-white/80 border-l-2 border-transparent'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-yellow-500' : 'bg-white/20'}`} />
                        {source}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-white/50 uppercase tracking-wider">Live</span>
            <span className="text-white/30">•</span>
            <span className="text-white/30 font-mono">{Object.values(fluxByCountry).flat().length} sources</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
