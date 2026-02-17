import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Configuration des notifications (comment elles apparaissent quand l'app est ouverte)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Demander les permissions et obtenir le push token
 */
export async function registerForPushNotifications(): Promise<string | undefined> {
  let token: string | undefined;

  if (!Device.isDevice) {
    console.log('⚠️ Push notifications require a physical device');
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Permission de notification refusée');
    return undefined;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || '72f67e44-ecbe-4df7-95c9-f00dd7204d90';
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('✅ Push token obtenu');
  } catch (error) {
    console.error('❌ Erreur obtention push token:', error);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  return token;
}

/**
 * Écouter les notifications reçues quand l'app est ouverte
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Écouter les notifications cliquées (quand l'app est fermée/background)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Envoyer une notification locale (test)
 */
export async function scheduleLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      badge: 1,
    },
    trigger: null,
  });
}
