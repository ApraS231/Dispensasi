import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { SISWA_TABS } from '../../src/components/BottomTabBar';

export default function SiswaLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const hideTabBar = pathname.includes('/pengajuan') || pathname.includes('/qr/');
  const activeTab = pathname.split('/').pop() || 'dashboard';

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="riwayat" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="pengajuan" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="qr/[id]" />
      </Stack>
      
      {!hideTabBar && (
        <BottomTabBar 
          tabs={SISWA_TABS} 
          activeTab={activeTab} 
          onTabPress={(tab) => {
            if (tab === 'pengajuan') router.push('/(siswa)/pengajuan');
            else router.push(`/(siswa)/${tab}`);
          }} 
        />
      )}
    </View>
  );
}
