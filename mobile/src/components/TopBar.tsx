import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';
import Svg, { Path } from 'react-native-svg';

interface TopBarProps {
  onAuthPress: () => void;
  onPremiumPress: () => void;
  onManageSubscription: () => void;
  onMenuPress: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onAuthPress, 
  onPremiumPress, 
  onManageSubscription,
  onMenuPress 
}) => {
  const { user, profile, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const isPremium = profile?.subscription_tier === 'PREMIUM';
  const initials = user?.email?.substring(0, 1).toUpperCase() || '';

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.content}>
          {/* Bouton Menu hamburger */}
          <Pressable onPress={onMenuPress} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          {/* Logo centré */}
          <View style={styles.logoContainer}>
            <Logo />
          </View>

          {/* Avatar rond (COMME LE SITE WEB) */}
          <View style={styles.rightSection}>
            {user ? (
              <Pressable onPress={() => setMenuVisible(!menuVisible)} style={styles.avatarButton}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill={COLORS.accentYellow1}>
                      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
                  </View>
                )}
              </Pressable>
            ) : (
              // AVATAR ROND GUEST (pas de texte "Connexion")
              <Pressable onPress={onAuthPress} style={styles.avatarButton}>
                <View style={[styles.avatar, styles.avatarGuest]}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
                    <Path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </Svg>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Modal pour le dropdown - couvre TOUT l'écran */}
      <Modal visible={user !== null && menuVisible} transparent animationType="none" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdownPositioner}>
            <View style={styles.dropdown}>
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  isPremium ? onManageSubscription() : onPremiumPress();
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>
                  {isPremium ? 'Gérer mon abonnement' : 'Accès illimité aux infos'}
                </Text>
              </Pressable>
              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  signOut();
                }}
                style={styles.dropdownItem}
              >
                <Text style={[styles.dropdownText, { color: '#f87171' }]}>Déconnexion</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 64,
  },
  menuButton: {
    padding: 8,
    width: 50,
  },
  menuIcon: {
    fontSize: 28,
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 50,
    alignItems: 'flex-end',
    position: 'relative',
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.dark2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentYellow1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0.4,
    elevation: 2,
  },
  avatarGuest: {
    backgroundColor: COLORS.dark3,
  },
  avatarText: {
    color: COLORS.accentYellow1,
    fontSize: 21,
    fontWeight: '300',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownPositioner: {
    position: 'absolute',
    top: 100,
    right: 16,
  },
  dropdown: {
    backgroundColor: '#0A0918',
    borderRadius: 8,
    minWidth: 200,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 197, 24, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 20,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    color: COLORS.accentYellow1,
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
