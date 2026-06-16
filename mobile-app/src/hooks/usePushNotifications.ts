import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import api from '../utils/api';
import { useAuthStore } from '../stores/authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B5E20',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token: Notification permissions not granted');
      return;
    }

    let projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.log('Project ID not found in app config, falling back to hardcoded ID');
      projectId = '30ca57fd-e2a9-4ae5-b06b-6cfde9559cf4';
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token successfully retrieved:', token);
    } catch (e: any) {
      console.error('Failed calling getExpoPushTokenAsync:', e?.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const token = useAuthStore((state) => state.token);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const router = useRouter();

  // Kirim device token ke backend HANYA setelah authenticated dengan retry logic
  useEffect(() => {
    let active = true;
    
    const sendToken = async (retryCount = 0) => {
      if (!expoPushToken || !token || !active) return;
      
      try {
        console.log(`Sending device token to backend (attempt ${retryCount + 1})...`);
        const response = await api.post('/user/device-token', { device_token: expoPushToken });
        console.log('Device token successfully saved to backend:', response.data);
      } catch (e: any) {
        console.warn(`Attempt ${retryCount + 1} failed to save device token:`, e?.message);
        
        if (retryCount < 3 && active) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          setTimeout(() => {
            sendToken(retryCount + 1);
          }, delay);
        } else {
          console.error('Max retries reached. Device token not saved to backend.', e?.message);
        }
      }
    };

    sendToken();

    return () => {
      active = false;
    };
  }, [expoPushToken, token]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      setTimeout(() => {
        if (data?.ticket_id) {
          router.push(`/ticket/${data.ticket_id}`);
        } else if (data?.type === 'parent_link') {
          router.push('/(siswa)/parent-requests');
        } else if (data?.type === 'parent_link_response') {
          router.push('/(ortu)/kelola-anak');
        } else {
          // Fallback to notifications list if no specific route found
          router.push('/notifications');
        }
      }, 500); // Delay for cold starts
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
};

