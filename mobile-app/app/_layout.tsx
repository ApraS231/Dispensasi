import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../src/stores/authStore';
import api from '../src/utils/api';
import { useFonts } from 'expo-font';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { usePushNotifications } from '../src/hooks/usePushNotifications';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setToken, setLoading } = useAuthStore();
  const { expoPushToken } = usePushNotifications();
  
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setToken(token);
          const response = await api.get('/user');
          setUser(response.data);
        }
      } catch (error) {
        await SecureStore.deleteItemAsync('userToken');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  );
}
