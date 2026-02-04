import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  resendOtp: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  isPremium: boolean;
  showPasswordResetModal: boolean;
  clearPasswordResetModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // Vérifier si l'utilisateur est premium
  const isPremium = profile?.is_premium && (!profile.premium_until || new Date(profile.premium_until) > new Date());

  const clearPasswordResetModal = () => setShowPasswordResetModal(false);

  useEffect(() => {
    // Debug: Logger tout ce qui se passe au chargement
    console.log('🔍 URL complète au chargement:', window.location.href);
    console.log('🔍 Hash:', window.location.hash);
    
    // Vérifier si on vient d'un lien de récupération
    const isRecovery = sessionStorage.getItem('supabase_password_recovery');
    const savedAccessToken = sessionStorage.getItem('supabase_recovery_access_token');
    const savedRefreshToken = sessionStorage.getItem('supabase_recovery_refresh_token');
    
    if (isRecovery === 'true') {
      console.log('⏳ Recovery détecté, on attend que Supabase traite le hash...');
      
      // Si on a capturé les tokens, restaurer la session manuellement
      if (savedAccessToken) {
        console.log('🔑 Restauration manuelle de la session avec les tokens capturés...');
        supabase.auth.setSession({
          access_token: savedAccessToken,
          refresh_token: savedRefreshToken || '',
        }).then(({ data, error }) => {
          if (error) {
            console.error('❌ Erreur lors de la restauration de session:', error);
          } else {
            console.log('✅ Session restaurée manuellement!', data.session ? 'Existe' : 'Null');
            if (data.session) {
              setShowPasswordResetModal(true);
              setSession(data.session);
              setUser(data.session.user);
              // Ne pas charger le profil, on est en mode reset password
              setLoading(false);
            }
          }
          // Nettoyer les tokens stockés
          sessionStorage.removeItem('supabase_recovery_access_token');
          sessionStorage.removeItem('supabase_recovery_refresh_token');
          sessionStorage.removeItem('supabase_password_recovery');
        });
      }
    }
    
    // Écouter les changements d'authentification EN PREMIER
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event);
      console.log('🔐 Session dans event:', session ? 'Existe' : 'Null');
      
      // Détecter la récupération de mot de passe
      if (event === 'PASSWORD_RECOVERY') {
        console.log('✅ PASSWORD_RECOVERY détecté avec session!');
        setShowPasswordResetModal(true);
        sessionStorage.removeItem('supabase_password_recovery');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && event !== 'PASSWORD_RECOVERY') {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        if (!isRecovery) {
          setLoading(false);
        }
      }
    });

    // Récupérer la session normalement si pas de recovery
    if (!isRecovery || !savedAccessToken) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('📦 Session récupérée:', session ? 'Existe' : 'Null');
        
        if (!user) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            loadProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // Charger le profil utilisateur
  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  // Inscription
  async function signUp(email: string, password: string, username: string) {
    try {
      // Vérifier si le username est déjà pris
      const { data: existingUsername, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUsername) {
        return { error: { message: 'Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.' } as AuthError };
      }

      // Vérifier si l'email est déjà utilisé
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        return { error: { message: 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.' } as AuthError };
      }

      // Créer le compte
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        // Traduire les erreurs Supabase en français
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          return { error: { message: 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.' } as AuthError };
        }
        return { error };
      }

      // Mettre à jour le username dans le profil (car trigger crée avec email avant @)
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } as AuthError };
    }
  }

  // Connexion
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  // Déconnexion
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  // Vérifier le code OTP
  async function verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) return { error };

    // Charger le profil après vérification
    if (data.user) {
      await loadProfile(data.user.id);
    }

    return { error: null };
  }

  // Renvoyer le code OTP
  async function resendOtp(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  }

  // Demander la réinitialisation du mot de passe
  async function resetPassword(email: string) {
    // Utiliser la variable d'environnement ou fallback sur l'origin actuelle
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  }

  // Mettre à jour le mot de passe (après clic sur lien email)
  async function updatePassword(newPassword: string) {
    console.log('🔑 Tentative de mise à jour du mot de passe...');
    console.log('🔑 Session actuelle:', session ? 'Existe' : 'NULL');
    console.log('🔑 User actuel:', user ? user.email : 'NULL');
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error('❌ Erreur updatePassword:', error);
    } else {
      console.log('✅ Mot de passe mis à jour avec succès!', data);
    }
    
    return { error };
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    verifyOtp,
    resendOtp,
    resetPassword,
    updatePassword,
    isPremium,
    showPasswordResetModal,
    clearPasswordResetModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
