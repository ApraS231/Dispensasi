import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { PIKET_TABS } from '../../src/components/BottomTabBar';

export default function PiketLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const hideTabBar = pathname.includes('/scan-qr') || pathname.includes('/qr/');
  const activeTab = pathname.split('/').pop() || 'dashboard';

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="queue" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="scan-qr" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>

      {!hideTabBar && (
        <BottomTabBar
          tabs={PIKET_TABS}
          activeTab={activeTab}
          onTabPress={(tab) => {
            if (activeTab !== tab) {
              router.push(`/(piket)/${tab}` as any);
            }
          }}
        />
      )}
    </View>
  );
}
