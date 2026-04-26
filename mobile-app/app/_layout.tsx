import { useEffect } from 'react';
import { Slot, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../src/stores/authStore';
import api from '../src/utils/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Gagal mendapatkan izin untuk push notification!');
      return;
    }
    
    // Gunakan projectId dari environment atau secara otomatis (karena kita tidak pakai EAS build saat ini)
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    console.log('Harus menggunakan perangkat fisik untuk Push Notifications');
  }
  return token;
}

export default function RootLayout() {
  const { setUser, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setToken(token);
          const response = await api.get('/user');
          setUser(response.data);

          // Daftarkan Push Notification setelah login sukses
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
             try {
                await api.post('/user/device-token', { device_token: pushToken });
             } catch (e) {
                console.error("Failed to send push token to server", e);
             }
          }
        }
      } catch (error) {
        await SecureStore.deleteItemAsync('userToken');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return <Slot />;
}
