
import React, { useState, useEffect } from 'react';
import { COLORS } from '../src/constants';
import Logo from './Logo';
import { useAuth } from '../src/contexts/AuthContext';
import { AuthModal } from '../src/components/AuthModal';
import { PremiumModal } from '../src/components/PremiumModal';

const TopBar: React.FC = () => {
  const { user, profile, signOut, isPremium, loading, showPasswordResetModal, clearPasswordResetModal } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Ouvrir le modal automatiquement quand PASSWORD_RECOVERY est détecté
  useEffect(() => {
    if (showPasswordResetModal) {
      console.log('🔓 Ouverture du modal de réinitialisation');
      setShowAuthModal(true);
    }
    
    // Détecter les erreurs dans l'URL (lien expiré, etc.)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error === 'access_denied' && errorDescription?.includes('expired')) {
      alert('Le lien de réinitialisation de mot de passe a expiré. Veuillez demander un nouveau lien via "Mot de passe oublié".');
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showPasswordResetModal]);

  const handleCloseModal = () => {
    setShowAuthModal(false);
    clearPasswordResetModal();
  };

  return (
    <header 
      className="h-[64px] border-b border-white/5 flex items-center justify-between px-6 z-20"
      style={{ backgroundColor: COLORS.dark2 }}
    >
      <Logo />

      <div className="flex items-center gap-6">
        {/* Auth section */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        ) : user && profile ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
            >
              {/* Avatar avec badge premium */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                {isPremium && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="url(#premium-gradient)">
                      <defs>
                        <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-sm text-white/90 font-medium truncate max-w-[120px]">{profile.username}</span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-40 border border-white/10" style={{ backgroundColor: COLORS.dark2 }}>
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm text-white/90 font-medium truncate" title={profile.username}>{profile.username}</p>
                    <p className="text-xs text-white/50 truncate" title={profile.email}>{profile.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 transition-colors">
                      Mon profil
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 transition-colors">
                      Préférences
                    </button>
                    {isPremium ? (
                      <button 
                        onClick={async () => {
                          setShowUserMenu(false);
                          try {
                            // Récupérer le customer_id depuis la DB
                            const response = await fetch(`https://daka-news-backend.onrender.com/api/stripe/create-portal-session`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user?.id }),
                            });
                            const data = await response.json();
                            if (data.success && data.url) {
                              window.location.href = data.url;
                            }
                          } catch (err) {
                            console.error('Erreur ouverture portail:', err);
                            alert('Impossible d\'ouvrir le portail de gestion');
                          }
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-yellow-500 hover:bg-white/5 transition-colors font-medium"
                      >
                        ⚙️ Gérer mon abonnement
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowPremiumModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-yellow-500 hover:bg-white/5 transition-colors font-medium"
                      >
                        ⭐ Passer Premium
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Se connecter
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={handleCloseModal} />
      
      {/* Premium Modal */}
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </header>
  );
};

export default TopBar;

