import { COLORS } from '../constants';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl border border-yellow-500/20 overflow-hidden flex flex-col"
        style={{ backgroundColor: COLORS.dark2 }}
      >
        {/* Header avec gradient jaune */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${COLORS.accentYellow1}, ${COLORS.accentYellow2})`
          }}
        />

        {/* Titre */}
        <div className="p-6 pb-4 border-b border-white/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold pr-8" style={{ color: COLORS.accentYellow1 }}>
            {title}
          </h2>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div 
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: COLORS.white }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
