import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
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
import LiquidBackground from '../src/components/LiquidBackground';

SplashScreen.preventAutoHideAsync();

focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active');
  });
  return () => subscription.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,       // 30 detik sebelum data dianggap stale
      gcTime: 10 * 60 * 1000,      // 10 menit garbage collection
      retry: 2,
      refetchOnWindowFocus: true,   // Refetch saat app kembali ke foreground
      refetchOnReconnect: true,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <LiquidBackground />
      <Slot />
    </QueryClientProvider>
  );
}
