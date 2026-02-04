import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../services/stripeService';
import { AuthModal } from './AuthModal';
import { COLORS } from '../constants';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [wasInSignupFlow, setWasInSignupFlow] = useState(false);

  // Détecter si l'user vient de se connecter depuis le flux premium
  useEffect(() => {
    if (user && wasInSignupFlow && isOpen) {
      // User connecté + on était dans le flux signup → Transition immédiate
      setShowAuth(false);
      setShowTransition(true);
      setWasInSignupFlow(false);
    }
  }, [user, wasInSignupFlow, isOpen]);

  // Reset states quand le modal s'ouvre (SAUF wasInSignupFlow)
  useEffect(() => {
    if (isOpen && !user) {
      // Reset uniquement si pas connecté
      setShowAuth(false);
      setShowTransition(false);
      setCountdown(2);
      setWasInSignupFlow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        // Si pas connecté, afficher AuthModal
        setShowAuth(true);
        setWasInSignupFlow(true); // Marquer qu'on est dans le flux d'inscription
        setLoading(false);
        return;
      }

      // Si connecté, rediriger vers Stripe
      await redirectToCheckout(user.id, user.email!);
    } catch (err: any) {
      console.error('Erreur lors de la redirection vers Stripe:', err);
      setError(err.message || 'Une erreur est survenue lors de la redirection vers le paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipCountdown = () => {
    handleSubscribe();
  };

  // Afficher transition après connexion
  if (showTransition) {
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
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${COLORS.accentYellow1}, ${COLORS.accentYellow2})`
              }}
            />

            {/* Contenu */}
            <div className="p-10 text-center">
              {/* Checkmark animé */}
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${COLORS.accentYellow1}15`,
                  border: `3px solid ${COLORS.accentYellow1}`
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path 
                    d="M10 20 L16 26 L30 12" 
                    stroke={COLORS.accentYellow1}
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Message */}
              <h2 
                className="text-xl sm:text-2xl font-bold mb-3 whitespace-nowrap"
                style={{ color: COLORS.accentYellow1 }}
              >
                Compte créé avec succès
              </h2>
              
              <p 
                className="text-sm sm:text-base mb-8 whitespace-nowrap"
                style={{ color: COLORS.gray }}
              >
                Activation de votre accès illimité en cours...
              </p>

              {/* Bouton avec compte à rebours */}
              <button
                onClick={handleSkipCountdown}
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: COLORS.accentYellow1,
                  color: COLORS.dark1
                }}
              >
                {loading ? 'Redirection...' : 'Poursuivre'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Afficher AuthModal si l'user clique sur "Accéder en illimité" sans être connecté
  if (showAuth) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {
          // Fermer seulement l'AuthModal, pas le PremiumModal parent
          setShowAuth(false);
        }}
        initialTab="signup"
      />
    );
  }

  // Afficher le PremiumModal par défaut avec les bénéfices
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
