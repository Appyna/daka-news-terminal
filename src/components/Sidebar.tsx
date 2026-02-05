
import React, { useState } from 'react';
import { COLORS, FREE_SOURCES } from '../constants';
import SettingsModal from './SettingsModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountry: string;
  currentSource: string;
  onSelectFlux: (country: string, source: string) => void;
  isPremium: boolean;
  onPremiumRequired: () => void;
}

const fluxByCountry = {
  "Israel": [
    "Ynet", "Arutz 7", "Arutz 14", "Israel Hayom", "Walla"
  ],
  "France": [
    "BFM TV", "France Info", "Le Monde"
  ],
  "Monde": [
    "BBC World", "Reuters", "ANADOLU (Agence de presse turque)", "Bloomberg", "FOXNews", "New York Times", "POLITICO", "RT - Russie", "TASS (Agence de presse russe)"
  ]
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentCountry, currentSource, onSelectFlux, isPremium, onPremiumRequired }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const handleSourceClick = (country: string, source: string) => {
    const isSourceFree = FREE_SOURCES.includes(source);
    
    if (!isSourceFree && !isPremium) {
      // Source premium et utilisateur non-premium → afficher popup
      onPremiumRequired();
      return;
    }
    
    // Source gratuite ou utilisateur premium → changer de source
    onSelectFlux(country, source);
    onClose();
  };

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
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">Live</h2>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-white/40">Sélectionner une source d'infos</p>
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
                    const isSourceFree = FREE_SOURCES.includes(source);
                    const isLocked = !isSourceFree && !isPremium;
                    
                    return (
                      <button
                        key={source}
                        onClick={() => handleSourceClick(country, source)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-all text-xs flex items-center gap-2 ${
                          isActive 
                            ? 'bg-yellow-500/15 text-yellow-500 font-semibold border-l-2 border-yellow-500' 
                            : 'hover:bg-white/5 text-white/75 hover:text-white border-l-2 border-transparent'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-yellow-500' : 'bg-white/20'}`} />
                        <span className="flex-1">{source}</span>
                        {isLocked && (
                          <svg 
                            className="w-3 h-3 flex-shrink-0" 
                            style={{ color: COLORS.accentYellow1 }}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10.5px] text-white/40 leading-relaxed">
              Actualités traduites par intelligence artificielle. Des erreurs peuvent survenir.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="flex-shrink-0 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Paramètres"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal des paramètres */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

export default Sidebar;
