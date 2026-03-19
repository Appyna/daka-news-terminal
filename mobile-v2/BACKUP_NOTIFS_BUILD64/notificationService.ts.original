import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

/**
 * Logger les étapes de debug vers Supabase
 */
async function logDebug(stage: string, data: any) {
  try {
    const deviceId = Constants.installationId || Constants.sessionId || 'unknown';
    await supabase.from('push_debug_logs').insert({
      device_id: deviceId,
      stage,
      is_device: Device.isDevice,
      platform: Platform.OS,
      ...data
    });
  } catch (e) {
    // Silencieux - ne pas bloquer le flow
  }
}

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
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || '72f67e44-ecbe-4df7-95c9-f00dd7204d90';

  await logDebug('function-start', { project_id: projectId });

  // ✅ ANDROID: Attendre 2 secondes que Firebase s'initialise complètement
  if (Platform.OS === 'android') {
    await logDebug('waiting-firebase-init', { wait_ms: 2000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // COMMENTÉ TEMPORAIREMENT POUR DEBUG
  // if (!Device.isDevice) {
  //   await logDebug('not-device', {});
  //   return undefined;
  // }

  try {
    await logDebug('permission-request', {});
    
    // FORCER la demande de permission (affichera popup sur Android 13+)
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    });

    await logDebug('permission-response', { permission_status: status });

    if (status !== 'granted') {
      await logDebug('permission-denied', { permission_status: status });
      // Pas d'alert - tout est dans les logs Supabase
      return undefined;
    }

    // Essayer 5 fois avec délais plus longs (Firebase DOIT être initialisé)
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await logDebug('get-token-attempt', { attempt_number: attempt, project_id: projectId });
        
        const tokenResult = await Notifications.getExpoPushTokenAsync({ 
          projectId: projectId 
        });
        token = tokenResult.data;
        
        if (token) {
          await logDebug('get-token-success', { token, attempt_number: attempt });
          break;
        } else {
          await logDebug('get-token-empty', { attempt_number: attempt });
        }
      } catch (error: any) {
        await logDebug('get-token-error', { 
          attempt_number: attempt,
          error: { 
            message: error?.message, 
            code: error?.code,
            name: error?.name,
            stack: error?.stack 
          }
        });
        
        if (attempt === 5) throw error;
        // Délais plus longs: 2s, 3s, 4s, 5s
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    // Vérifier qu'on a bien un token
    if (!token) {
      await logDebug('no-token-generated', {});
      // UN SEUL POPUP si échec complet
      alert('⚠️ Notification token generation failed. Check Supabase logs for details.');
      return undefined;
    }
  } catch (error: any) {
    const errorMsg = error?.message || error?.code || 'Unknown error';
    
    await logDebug('fatal-error', { 
      error: { 
        message: error?.message, 
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
        full: JSON.stringify(error)
      }
    });
    
    // UN SEUL POPUP avec l'erreur principale
    alert(`⚠️ Notification setup failed: ${errorMsg}\n\nCheck Supabase push_debug_logs for full details.`);
    return undefined;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD700',
      });
    } catch (error) {
      // Silencieux
    }
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
