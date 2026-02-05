import { COLORS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-2xl border border-yellow-500/20 overflow-hidden"
        style={{ backgroundColor: COLORS.dark2 }}
      >
        {/* Header avec gradient jaune */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${COLORS.accentYellow1}, ${COLORS.accentYellow2})`
          }}
        />

        <div className="p-8">
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Titre */}
          <h2 
            className="text-2xl font-bold text-center mb-6"
            style={{ color: COLORS.white }}
          >
            Paramètres
          </h2>

          {/* Menu des liens */}
          <div className="space-y-3">
            <button
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">Conditions Générales d'Utilisation</span>
              </div>
            </button>

            <button
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm">Conditions Générales de Vente</span>
              </div>
            </button>

            <button
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">Politique de Confidentialité</span>
              </div>
            </button>

            <button
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: COLORS.white }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Nous contacter</span>
              </div>
            </button>
          </div>

          {/* Info version */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs" style={{ color: COLORS.gray }}>
              DAKA News Terminal v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
