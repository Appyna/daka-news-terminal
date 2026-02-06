import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setError('Email de réinitialisation envoyé !');
        setTimeout(() => {
          setMode('login');
          setError('');
        }, 2000);
      } else if (mode === 'signup') {
        await signUp(email, password);
        setError('Compte créé ! Vérifiez votre email.');
        setTimeout(() => onClose(), 2000);
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.container}>
          {/* Header gradient */}
          <View style={styles.headerGradient} />
          
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Tabs */}
            {mode !== 'reset' && (
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, mode === 'login' && styles.tabActive]}
                  onPress={() => setMode('login')}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                    Connexion
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mode === 'signup' && styles.tabActive]}
                  onPress={() => setMode('signup')}
                >
                  <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                    Inscription
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'reset' && (
              <Text style={styles.resetTitle}>Réinitialiser le mot de passe</Text>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            {mode !== 'reset' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Error */}
            {error && (
              <Text style={[styles.error, error.includes('!') && styles.success]}>
                {error}
              </Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.dark1} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'reset' ? 'Envoyer' : mode === 'signup' ? "S'inscrire" : 'Se connecter'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Reset password link */}
            {mode === 'login' && (
              <TouchableOpacity onPress={() => setMode('reset')} style={styles.linkContainer}>
                <Text style={styles.link}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}

            {mode === 'reset' && (
              <TouchableOpacity onPress={() => setMode('login')} style={styles.linkContainer}>
                <Text style={styles.link}>Retour à la connexion</Text>
              </TouchableOpacity>
            )}

            {/* CGU Disclaimer */}
            <Text style={styles.disclaimer}>
              En vous inscrivant, vous acceptez nos Conditions Générales d'Utilisation et notre Politique de Confidentialité.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.dark2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
    overflow: 'hidden',
  },
  headerGradient: {
    height: 4,
    backgroundColor: COLORS.accentYellow1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '300',
  },
  content: {
    padding: 24,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accentYellow1,
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabTextActive: {
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  resetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.dark3,
    borderWidth: 1,
    borderColor: COLORS.dark3,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.white,
  },
  error: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  success: {
    color: '#00FF88',
  },
  button: {
    backgroundColor: COLORS.accentYellow1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.dark1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    color: COLORS.accentYellow1,
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});
