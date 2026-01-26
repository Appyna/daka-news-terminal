
import React, { useState } from 'react';
import { COLORS } from '../constants';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: (data: { countries: string[]; sources: string[]; language: string }) => void;
}

const steps = [
  { id: 1, title: "Accueil", description: "Bienvenue sur DAKA News — le terminal d'information professionnel par pays et par source." },
  { id: 2, title: "Pays", description: "Sélectionnez les pays que vous souhaitez suivre pour votre veille.", options: ["Israel", "États-Unis", "France", "Iran", "Russie"] },
  { id: 3, title: "Sources", description: "Choisissez les médias par pays qui apparaîtront en colonnes.", options: ["Ynet", "CNN", "AFP", "Reuters"] },
  { id: 4, title: "Langue", description: "Sélectionnez la langue d'affichage des textes traduits.", options: ["Français", "Anglais", "Hébreu"] },
  { id: 5, title: "Finalisation", description: "Votre tableau de veille est prêt. Les colonnes sont synchronisées en temps réel." }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    countries: [] as string[],
    sources: [] as string[],
    language: 'Français'
  });

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(selections);
    }
  };

  const toggleOption = (list: 'countries' | 'sources', val: string) => {
    setSelections(prev => ({
      ...prev,
      [list]: prev[list].includes(val) 
        ? prev[list].filter(x => x !== val) 
        : [...prev[list], val]
    }));
  };

  const stepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0918]">
      <div className="w-full max-w-md p-8 flex flex-col items-center text-center">
        <div className="mb-12">
          <Logo />
        </div>

        <div className="mb-2 text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em]">
          Etape {stepData.id} de {steps.length}
        </div>
        
        <h2 className="text-2xl font-extrabold mb-4 text-white">
          {stepData.title}
        </h2>
        
        <p className="text-white/60 mb-8 text-sm leading-relaxed max-w-xs">
          {stepData.description}
        </p>

        {stepData.options && (
          <div className="grid grid-cols-2 gap-3 mb-8 w-full">
            {stepData.options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  if (currentStep === 1) toggleOption('countries', opt);
                  else if (currentStep === 2) toggleOption('sources', opt);
                  else if (currentStep === 3) setSelections(p => ({ ...p, language: opt }));
                }}
                className={`py-3 px-4 rounded-lg border-2 text-xs font-bold transition-all ${
                  (currentStep === 1 && selections.countries.includes(opt)) ||
                  (currentStep === 2 && selections.sources.includes(opt)) ||
                  (currentStep === 3 && selections.language === opt)
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' 
                    : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={next}
          className="w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all"
          style={{ backgroundColor: COLORS.accentYellow1, color: COLORS.dark2 }}
        >
          {currentStep === steps.length - 1 ? 'Accéder au Terminal' : 'Continuer'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
