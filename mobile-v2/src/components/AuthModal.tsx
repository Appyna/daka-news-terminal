import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  redirectToPremium?: boolean;
  initialTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, redirectToPremium = false, initialTab = 'login' }) => {
  const { signIn, signUp, resetPassword, verifyOtp, resendOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // ✅ COPIE EXACTE DU SITE WEB : États OTP
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Traduction complète des erreurs Supabase en français
  const translateError = (errorMessage: string): string => {
    const errorMap: Record<string, string> = {
      // Erreurs d'authentification
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'Invalid email': 'Format d\'email invalide',
      'Unable to validate email address: invalid format': 'Format d\'email invalide',
      'Email rate limit exceeded': 'Trop de tentatives. Réessayez dans quelques minutes',
      'User not found': 'Aucun compte trouvé avec cet email',
      
      // Erreurs d'inscription
      'User already registered': 'Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse',
      'already registered': 'Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse',
      'already been registered': 'Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse',
      'Signups not allowed for this instance': 'Les inscriptions sont temporairement désactivées',
      'Ce nom d\'utilisateur est déjà utilisé': 'Ce nom d\'utilisateur est déjà utilisé. Choisissez-en un autre',
      'Cette adresse email est déjà utilisée': 'Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse',
      
      // Erreurs de mot de passe
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Password is too weak': 'Le mot de passe est trop faible. Utilisez au moins une majuscule, un chiffre et un caractère spécial',
      'New password should be different from the old password': 'Le nouveau mot de passe doit être différent de l\'ancien',
      
      // Erreurs de lien/token
      'Email link is invalid or has expired': 'Le lien email est invalide ou a expiré',
      'Token has expired or is invalid': 'Le code a expiré. Demandez un nouveau code',
      'Token expired': 'Le code a expiré. Demandez un nouveau code',
      'Invalid token': 'Code invalide. Vérifiez le code reçu par email',
      
      // Rate limiting
      'For security purposes, you can only request this once every 60 seconds': 'Attendez 60 secondes avant de réessayer',
      'Too many requests': 'Trop de tentatives. Réessayez dans quelques instants',
      
      // Erreurs OTP
      'OTP expired': 'Le code a expiré. Demandez un nouveau code',
      'Invalid OTP': 'Code invalide. Vérifiez le code à 6 chiffres reçu par email',
      'Email OTP has already been used': 'Ce code a déjà été utilisé. Demandez un nouveau code',
    };

    // Chercher une correspondance exacte
    if (errorMap[errorMessage]) {
      return errorMap[errorMessage];
    }

    // Chercher une correspondance partielle
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Messages par défaut plus précis
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('email') && (lowerMessage.includes('already') || lowerMessage.includes('déjà') || lowerMessage.includes('exist'))) {
      return 'Cette adresse email est déjà utilisée. Connectez-vous ou utilisez une autre adresse';
    }
    
    if (lowerMessage.includes('username') || lowerMessage.includes('utilisateur')) {
      return 'Ce nom d\'utilisateur est déjà utilisé. Choisissez-en un autre';
    }
    
    if (lowerMessage.includes('email') && lowerMessage.includes('format')) {
      return 'Format d\'email invalide. Vérifiez l\'adresse saisie';
    }
    
    if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
      return 'Le mot de passe est trop faible. Utilisez au moins 6 caractères';
    }
    
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
      return 'Trop de tentatives. Réessayez dans quelques instants';
    }
    
    if (lowerMessage.includes('token') || lowerMessage.includes('code') || lowerMessage.includes('otp')) {
      return 'Code invalide ou expiré. Vérifiez le code reçu par email';
    }

    // Message générique en dernier recours
    return 'Une erreur est survenue. Vérifiez vos informations et réessayez';
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (activeTab === 'signup' && !username) {
      setError('Veuillez entrer un nom d\'utilisateur');
      return;
    }

    if (activeTab === 'signup' && username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'login') {
        await signIn(email, password);
        setSuccessMessage('Connexion réussie !');
        setTimeout(() => onClose(), 800);
      } else {
        // ✅ COPIE EXACTE DU SITE WEB : Inscription avec OTP
        const result = await signUp(email, password, username);
        
        // Vérifier si Supabase demande une confirmation OTP
        if (result?.user) {
          // ✅ MESSAGE EXACT DU SITE WEB
          setSuccessMessage('Un code de vérification a été envoyé à votre adresse email.');
          setPendingEmail(email);
          setShowOtpInput(true);
        }
      }
    } catch (err: any) {
      const translatedError = translateError(err.message || 'Une erreur est survenue');
      setError(translatedError);
      console.error('Auth error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSuccessMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      setTimeout(() => {
        setShowResetPassword(false);
        setSuccessMessage('');
        setEmail('');
      }, 3000);
    } catch (err: any) {
      const translatedError = translateError(err.message || 'Erreur lors de l\'envoi de l\'email');
      setError(translatedError);
      console.error('Reset password error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ COPIE EXACTE DU SITE WEB : handleVerifyOtp
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await verifyOtp(pendingEmail, otpCode);
      
      if (verifyError) {
        // ✅ MESSAGE EXACT DU SITE WEB pour erreur OTP
        if (verifyError.message === 'Token has expired or is invalid') {
          setError('Le code de vérification est expiré ou invalide. Veuillez demander un nouveau code.');
        } else {
          setError(translateError(verifyError.message));
        }
      } else {
        // ✅ MESSAGE EXACT DU SITE WEB pour succès
        setSuccessMessage('Votre adresse email a été vérifiée avec succès. Connexion en cours...');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Erreur lors de la vérification du code'));
      console.error('Verify OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ COPIE EXACTE DU SITE WEB : handleResendOtp
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: resendError } = await resendOtp(pendingEmail);
      
      if (resendError) {
        setError('Erreur lors du renvoi du code de vérification. Veuillez réessayer.');
      } else {
        // ✅ MESSAGE EXACT DU SITE WEB
        setSuccessMessage('Un nouveau code de vérification a été envoyé à votre adresse email.');
      }
    } catch (err: any) {
      setError('Erreur lors du renvoi du code de vérification. Veuillez réessayer.');
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            {/* Barre jaune en haut */}
            <View style={styles.yellowBar} />

            {/* Titre principal */}
            <Text style={styles.mainTitle}>
              {activeTab === 'login' ? 'Connexion' : 'Créer un compte'}
            </Text>

            {/* Tabs avec underline jaune */}
            <View style={styles.tabsContainer}>
              <Pressable
                style={styles.tab}
                onPress={() => {
                  setActiveTab('login');
                  setError('');
                  setSuccessMessage('');
                  setShowResetPassword(false);
                }}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Connexion
                </Text>
                {activeTab === 'login' && <View style={styles.tabUnderline} />}
              </Pressable>

              <Pressable
                style={styles.tab}
                onPress={() => {
                  setActiveTab('signup');
                  setError('');
                  setSuccessMessage('');
                  setShowResetPassword(false);
                }}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                  Inscription
                </Text>
                {activeTab === 'signup' && <View style={styles.tabUnderline} />}
              </Pressable>
            </View>

            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              {showResetPassword ? (
                /* Mode Reset Password */
                <>
                  <Text style={styles.subtitle}>
                    Entrez votre email et nous vous enverrons un lien de réinitialisation.
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="votre@email.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

                  <Pressable
                    style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.dark1} />
                    ) : (
                      <Text style={styles.ctaText}>Envoyer le lien</Text>
                    )}
                  </Pressable>

                  <Pressable onPress={() => setShowResetPassword(false)} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Retour</Text>
                  </Pressable>
                </>
              ) : (
                /* Mode Login/Signup normal */
                <>
                  {/* ✅ COPIE EXACTE DU SITE WEB : Écran OTP après inscription */}
                  {showOtpInput ? (
                    <>
                      <Text style={styles.otpDescription}>
                        Un code à 6 chiffres a été envoyé à {pendingEmail}
                      </Text>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Code de vérification</Text>
                        <TextInput
                          style={styles.otpInput}
                          placeholder="000000"
                          placeholderTextColor="rgba(255, 255, 255, 0.3)"
                          value={otpCode}
                          onChangeText={(text) => setOtpCode(text.replace(/\D/g, '').slice(0, 6))}
                          keyboardType="number-pad"
                          maxLength={6}
                          autoFocus
                        />
                      </View>

                      {error ? <Text style={styles.error}>{error}</Text> : null}
                      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

                      {/* Bouton Vérifier le code */}
                      <Pressable
                        style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color={COLORS.dark1} />
                        ) : (
                          <Text style={styles.ctaText}>Vérifier le code</Text>
                        )}
                      </Pressable>

                      {/* Lien Renvoyer le code */}
                      <Pressable onPress={handleResendOtp} disabled={loading} style={styles.resendButton}>
                        <Text style={styles.resendLink}>Renvoyer le code</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      {/* Formulaire Login/Signup normal */}
                  {/* Champ Nom d'utilisateur (uniquement pour Inscription) */}
                  {activeTab === 'signup' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nom d'utilisateur</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="3 à 20 caractères"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  )}

                  {/* Champ Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="votre@email.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Champ Mot de passe */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Minimum 6 caractères"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Mot de passe oublié (uniquement pour Connexion) */}
                  {activeTab === 'login' && (
                    <Pressable onPress={() => setShowResetPassword(true)} style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                    </Pressable>
                  )}

                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

                  {/* CGU (uniquement pour Inscription) - AVANT le bouton */}
                  {activeTab === 'signup' && (
                    <Text style={styles.cgu}>
                      En m'inscrivant, j'accepte les{' '}
                      <Text
                        style={styles.cguLink}
                        onPress={() => Linking.openURL('https://dakanews.com/cgu')}
                      >
                        conditions d'utilisation
                      </Text>{' '}
                      et de vente
                    </Text>
                  )}

                  {/* Bouton CTA */}
                  <Pressable
                    style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.dark1} />
                    ) : (
                      <Text style={styles.ctaText}>
                        {activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
                      </Text>
                    )}
                  </Pressable>
                    </>
                  )}
                </>
              )}
            </ScrollView>

            {/* Bouton fermer (X) */}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.dark2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  yellowBar: {
    height: 3,
    backgroundColor: COLORS.accentYellow1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 18,
    paddingTop: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 28,
  },
  tab: {
    flex: 1,
    paddingBottom: 10,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  tabTextActive: {
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.accentYellow1,
  },
  content: {
    maxHeight: 500,
  },
  contentContainer: {
    padding: 28,
    paddingTop: 28,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.dark3,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 11,
    color: COLORS.accentYellow1,
    fontWeight: '500',
  },
  error: {
    color: '#f87171',
    fontSize: 11,
    marginBottom: 14,
    textAlign: 'center',
  },
  success: {
    color: '#4ade80',
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  ctaButton: {
    backgroundColor: COLORS.accentYellow1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: COLORS.dark1,
    fontSize: 14,
    fontWeight: '700',
  },
  cgu: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 15,
  },
  cguLink: {
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.accentYellow1,
    fontSize: 13,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  // ✅ COPIE EXACTE DU SITE WEB : Styles OTP
  otpInput: {
    backgroundColor: COLORS.dark3,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 17,
  },
  resendButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  resendLink: {
    fontSize: 12,
    color: COLORS.accentYellow1,
    fontWeight: '500',
  },
});
