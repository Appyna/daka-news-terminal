import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { signIn, signUp, verifyOtp, resendOtp, resetPassword, updatePassword, showPasswordResetModal } = useAuth();

  // Détecter si on vient du magic link (PASSWORD_RECOVERY)
  React.useEffect(() => {
    if (isOpen && showPasswordResetModal) {
      console.log('🔐 AuthModal: Mode réinitialisation activé');
      setIsPasswordReset(true);
    }
  }, [isOpen, showPasswordResetModal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isPasswordReset) {
        // Réinitialisation du mot de passe
        if (newPassword.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        const { error } = await updatePassword(newPassword);
        if (error) {
          if (error.message.includes('same') || error.message.includes('different')) {
            setError('Le nouveau mot de passe doit être différent de l\'ancien mot de passe.');
          } else {
            setError('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.');
          }
        } else {
          setSuccess('Mot de passe mis à jour avec succès. Vous êtes maintenant connecté.');
          setTimeout(() => {
            onClose();
            resetForm();
            setIsPasswordReset(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 2000);
        }
      } else if (showOtpInput) {
        // Vérification du code OTP inscription
        if (otpCode.length !== 6) {
          setError('Le code doit contenir 6 chiffres');
          setLoading(false);
          return;
        }

        const { error } = await verifyOtp(pendingEmail, otpCode);
        if (error) {
          setError(error.message === 'Token has expired or is invalid' 
            ? 'Le code de vérification est expiré ou invalide. Veuillez demander un nouveau code.' 
            : error.message);
        } else {
          setSuccess('Votre adresse email a été vérifiée avec succès. Connexion en cours...');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        }
      } else if (activeTab === 'login') {
        // Connexion
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials' 
            ? 'Adresse email ou mot de passe incorrect.' 
            : error.message);
        } else {
          setSuccess('Connexion réussie.');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        }
      } else {
        // Inscription
        if (!username || username.length < 3) {
          setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Un code de vérification a été envoyé à votre adresse email.');
          setPendingEmail(email);
          setShowOtpInput(true);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await resendOtp(pendingEmail);
    if (error) {
      setError('Erreur lors du renvoi du code de vérification. Veuillez réessayer.');
    } else {
      setSuccess('Un nouveau code de vérification a été envoyé à votre adresse email.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await resetPassword(email);
    
    if (error) {
      setError('Erreur lors de l\'envoi du lien de réinitialisation. Veuillez réessayer.');
    } else {
      setSuccess('Un lien de réinitialisation a été envoyé à votre adresse email. Veuillez consulter votre boîte de réception.');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setOtpCode('');
    setShowOtpInput(false);
    setPendingEmail('');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
            onClick={handleClose}
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
            {isPasswordReset
              ? 'Nouveau mot de passe'
              : showOtpInput 
              ? 'Vérification email' 
              : activeTab === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>

          {/* Tabs - masquer si OTP ou reset password */}
          {!showOtpInput && !isPasswordReset && (
            <div className="flex border-b mb-6" style={{ borderColor: COLORS.dark3 }}>
              <button
                onClick={() => {
                  setActiveTab('login');
                  resetForm();
                }}
                className={`flex-1 py-3 text-center font-medium transition-all ${
                  activeTab === 'login'
                    ? 'border-b-2'
                    : ''
                }`}
                style={{
                  color: activeTab === 'login' ? COLORS.accentYellow1 : COLORS.gray,
                  borderColor: activeTab === 'login' ? COLORS.accentYellow1 : 'transparent'
                }}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setActiveTab('signup');
                  resetForm();
                }}
                className={`flex-1 py-3 text-center font-medium transition-all ${
                  activeTab === 'signup'
                    ? 'border-b-2'
                    : ''
                }`}
                style={{
                  color: activeTab === 'signup' ? COLORS.accentYellow1 : COLORS.gray,
                  borderColor: activeTab === 'signup' ? COLORS.accentYellow1 : 'transparent'
                }}
              >
                Inscription
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div 
              className="mb-4 p-3 border rounded-lg text-sm"
              style={{
                backgroundColor: '#7f1d1d20',
                borderColor: '#dc262680',
                color: '#fca5a5'
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div 
              className="mb-4 p-3 border rounded-lg text-sm"
              style={{
                backgroundColor: `${COLORS.accentYellow1}20`,
                borderColor: `${COLORS.accentYellow1}80`,
                color: COLORS.accentYellow1
              }}
            >
              {success}
            </div>
          )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isPasswordReset ? (
            /* Formulaire de réinitialisation du mot de passe */
            <>
              <p className="text-sm text-gray-600 mb-4">
                Entrez votre nouveau mot de passe ci-dessous.
              </p>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Confirmez votre mot de passe"
                  required
                  minLength={6}
                />
              </div>
            </>
          ) : showOtpInput ? (
            /* Champ code OTP inscription */
            <>
              <p className="text-sm text-gray-600 mb-4">
                Un code à 6 chiffres a été envoyé à <strong>{pendingEmail}</strong>
              </p>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  autoFocus
                />
              </div>
              
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Renvoyer le code
              </button>
            </>
          ) : (
            /* Formulaires login/signup */
            <>
              {activeTab === 'signup' && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="3 à 20 caractères"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_\-]+"
                    title="Lettres, chiffres, tirets et underscores uniquement (max 20 caractères)"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="votre@email.com"
                  required
                  maxLength={254}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                  maxLength={128}
                />
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : isPasswordReset ? 'Mettre à jour le mot de passe' : showOtpInput ? 'Vérifier le code' : activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        {/* Info premium */}
        {activeTab === 'signup' && !showOtpInput && (
          <p className="mt-4 text-xs text-center text-gray-500">
            Compte gratuit avec accès limité. Passez Premium pour un accès illimité à toutes les sources.
          </p>
        )}
      </div>
    </div>
  );
}
