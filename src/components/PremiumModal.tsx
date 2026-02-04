import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../services/stripeService';
import { COLORS } from '../constants';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      setError('Vous devez être connecté pour souscrire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await redirectToCheckout(user.id, user.email!);
    } catch (err: any) {
      console.error('Erreur lors de la redirection vers Stripe:', err);
      setError(err.message || 'Une erreur est survenue lors de la redirection vers le paiement');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="relative max-w-md w-full rounded-2xl shadow-2xl border border-yellow-500/20 overflow-hidden"
          style={{ backgroundColor: COLORS.dark2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec gradient jaune */}
          <div 
            className="h-2 w-full"
            style={{
              background: `linear-gradient(90deg, ${COLORS.accentYellow1}, ${COLORS.accentYellow2})`
            }}
          />

          {/* Contenu */}
          <div className="p-8">
            {/* Titre */}
            <h2 
              className="text-2xl font-bold mb-2 text-center"
              style={{ color: COLORS.accentYellow1 }}
            >
              Accédez à toutes les actualités mondiales en temps réel en Français
            </h2>

            {/* Liste des avantages */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 text-white/80">
                <div 
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS.accentYellow1 }}
                />
                <p className="text-sm leading-relaxed">
                  20+ sources en Israël, en France et dans le monde
                </p>
              </div>

              <div className="flex items-start gap-3 text-white/80">
                <div 
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS.accentYellow1 }}
                />
                <p className="text-sm leading-relaxed">
                  Flux continus 24h/24, 7j/7
                </p>
              </div>

              <div className="flex items-start gap-3 text-white/80">
                <div 
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS.accentYellow1 }}
                />
                <p className="text-sm leading-relaxed">
                  Traduit automatiquement en français
                </p>
              </div>

              <div className="flex items-start gap-3 text-white/80">
                <div 
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS.accentYellow1 }}
                />
                <p className="text-sm leading-relaxed">
                  Sans engagement, annulez quand vous le souhaitez
                </p>
              </div>
            </div>

            {/* Prix */}
            <div className="mt-8 text-center">
              <p 
                className="text-4xl font-bold"
                style={{ color: COLORS.accentYellow1 }}
              >
                1,99€
                <span className="text-lg text-white/50">/mois</span>
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Boutons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: COLORS.accentYellow1,
                  color: COLORS.dark1
                }}
              >
                {loading ? 'Redirection...' : 'Accéder en illimité'}
              </button>

              <button
                onClick={onClose}
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium text-sm transition-all hover:bg-white/5 disabled:opacity-50"
                style={{ color: COLORS.white }}
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
