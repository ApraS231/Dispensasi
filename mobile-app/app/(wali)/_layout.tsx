import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { WALI_TABS } from '../../src/components/BottomTabBar';
import TopAppBar from '../../src/components/TopAppBar';

export default function WaliLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.split('/').pop() || 'dashboard';
  const tabNames = WALI_TABS.map(t => t.name);
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
        <Stack.Screen name="queue" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="kelola-anak" />
        <Stack.Screen name="laporan-izin" />
      </Stack>
      
      {showTabBar && (
        <BottomTabBar 
          tabs={WALI_TABS} 
          activeTab={activeTab} 
          onTabPress={(tab) => {
            if (activeTab !== tab) {
              router.replace(`/(wali)/${tab}` as any);
            }
          }} 
        />
      )}
    </View>
  );
}
