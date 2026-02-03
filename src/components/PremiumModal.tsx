import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../services/stripeService';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full p-6 relative border border-yellow-500/20 shadow-xl">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          disabled={loading}
        >
          <X size={24} />
        </button>

        {/* Header avec gradient */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-xs font-bold text-gray-900 mb-3">
            PREMIUM
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Passez à DAKA News Premium
          </h2>
          <p className="text-gray-400">
            Accédez à toutes les fonctionnalités sans limites
          </p>
        </div>

        {/* Avantages */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Sources illimitées</p>
              <p className="text-sm text-gray-400">Suivez autant de sources d'information que vous le souhaitez</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Articles illimités</p>
              <p className="text-sm text-gray-400">Consultez autant d'articles que vous le désirez chaque jour</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Badge Premium</p>
              <p className="text-sm text-gray-400">Affichez fièrement votre statut Premium</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Support prioritaire</p>
              <p className="text-sm text-gray-400">Bénéficiez d'une assistance rapide et dédiée</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Nouvelles fonctionnalités en avant-première</p>
              <p className="text-sm text-gray-400">Accédez aux nouveautés avant tout le monde</p>
            </div>
          </div>
        </div>

        {/* Prix */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-yellow-500/20">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-white">4,99€</span>
            <span className="text-gray-400">/mois</span>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            Résiliable à tout moment
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Bouton d'abonnement */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirection vers Stripe...
            </span>
          ) : (
            'S\'abonner maintenant'
          )}
        </button>

        {/* Informations de paiement */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Paiement sécurisé par Stripe. Vous serez redirigé vers une page de paiement sécurisée.
        </p>
      </div>
    </div>
  );
}
