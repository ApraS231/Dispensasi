import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { PIKET_TABS } from '../../src/components/BottomTabBar';
import TopAppBar from '../../src/components/TopAppBar';

export default function PiketLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.split('/').pop() || 'dashboard';
  const tabNames = PIKET_TABS.map(t => t.name);
  const showTabBar = tabNames.includes(activeTab) && !pathname.includes('/scan-qr');

  return (
    <View style={{ flex: 1 }}>
      <TopAppBar isGlobal={true} />
      
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'simple_push',
        contentStyle: { backgroundColor: 'transparent' } 
      }}>
        <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="queue" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="scan-qr" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>

      {showTabBar && (
        <BottomTabBar
          tabs={PIKET_TABS}
          activeTab={activeTab}
          onTabPress={(tab) => {
            if (activeTab !== tab) {
              router.replace(`/(piket)/${tab}` as any);
            }
          }}
        />
      )}
    </View>
  );
}
