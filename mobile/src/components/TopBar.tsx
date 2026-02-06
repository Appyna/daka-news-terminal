import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';

interface TopBarProps {
  onAuthPress: () => void;
  onPremiumPress: () => void;
  onManageSubscription: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onAuthPress, onPremiumPress, onManageSubscription }) => {
  const { user, profile, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const isPremium = profile?.subscription_tier === 'PREMIUM';
  const initials = user?.email?.substring(0, 2).toUpperCase() || '';

  const handleAvatarPress = () => {
    if (user) {
      setMenuVisible(true);
    } else {
      onAuthPress();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.content}>
        <Logo />
        
        <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarButton}>
          <View style={[styles.avatar, !user && styles.avatarGuest]}>
            {user ? (
              <Text style={styles.avatarText}>{initials}</Text>
            ) : (
              <Text style={styles.avatarIcon}>👤</Text>
            )}
          </View>
          
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumStar}>⭐</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Menu déroulant */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            {isPremium ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onManageSubscription();
                }}
              >
                <Text style={styles.menuText}>Gérer mon abonnement</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onPremiumPress();
                }}
              >
                <Text style={styles.menuText}>Accès illimité aux infos</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                signOut();
              }}
            >
              <Text style={styles.menuText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dark2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentYellow1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0.4,
    elevation: 1,
  },
  avatarGuest: {
    backgroundColor: COLORS.dark3,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.accentYellow1,
  },
  avatarIcon: {
    fontSize: 20,
    color: COLORS.gray,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.dark2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumStar: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menu: {
    backgroundColor: COLORS.dark2,
    borderRadius: 8,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    color: COLORS.white,
    fontSize: 14,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
