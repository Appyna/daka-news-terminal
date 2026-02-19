import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthContextType, UserProfile } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ LOGIQUE CORRECTE isPremium (même que site web)
  const isPremium = Boolean(
    profile?.is_premium &&
    (!profile.premium_until || new Date(profile.premium_until) > new Date())
  );

  useEffect(() => {
    // Charger la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // VÉRIFICATION 1 : Username déjà pris ?
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUsername) {
        throw new Error('Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.');
      }

      // VÉRIFICATION 2 : Email déjà pris ?
      // On vérifie dans profiles ET auth.users pour couvrir tous les cas
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.');
      }

      // Double vérification dans auth.users (au cas où profil pas encore créé)
      const { data: emailInAuth } = await supabase.rpc('check_email_exists', { 
        check_email: email 
      });

      if (emailInAuth) {
        throw new Error('Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.');
      }

      // INSCRIPTION Supabase
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
        // Gérer les erreurs Supabase avec messages français
        if (error.message.includes('already registered') || error.message.includes('already been registered') || error.message.includes('User already registered')) {
          throw new Error('Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.');
        }
        throw error;
      }

      // Retourner data pour que AuthModal puisse afficher l'écran OTP
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Améliorer les messages d'erreur
      if (error.message === 'Invalid login credentials') {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.message === 'Email not confirmed') {
        throw new Error('Veuillez confirmer votre email avant de vous connecter');
      }
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'dakanews://reset-password', // Deep link vers l'app mobile
    });
    if (error) throw error;
  };

  // ✅ COPIE EXACTE DU SITE WEB : verifyOtp
  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        return { error };
      }

      // La session est créée automatiquement par Supabase après verifyOtp
      // onAuthStateChange se déclenchera et chargera le profil
      
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // ✅ COPIE EXACTE DU SITE WEB : resendOtp
  const resendOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isPremium,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        verifyOtp,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
