import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { ORTU_TABS } from '../../src/components/BottomTabBar';
import TopAppBar from '../../src/components/TopAppBar';

export default function OrtuLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.split('/').pop() || 'dashboard';
  const tabNames = ORTU_TABS.map(t => t.name);
  const showTabBar = tabNames.includes(activeTab);

  return (
    <View style={{ flex: 1 }}>
      <TopAppBar isGlobal={true} />
      
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'simple_push',
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="riwayat" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="kelola-anak" />
      </Stack>
      
      {showTabBar && (
        <BottomTabBar 
          tabs={ORTU_TABS} 
          activeTab={activeTab} 
          onTabPress={(tab) => {
            if (activeTab !== tab) {
              router.replace(`/(ortu)/${tab}` as any);
            }
          }} 
        />
      )}
    </View>
  );
}
