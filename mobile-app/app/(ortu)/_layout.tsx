import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { ORTU_TABS } from '../../src/components/BottomTabBar';

export default function OrtuLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.split('/').pop() || 'dashboard';

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="riwayat" />
        <Stack.Screen name="profile" />
      </Stack>
      
      <BottomTabBar 
        tabs={ORTU_TABS} 
        activeTab={activeTab} 
        onTabPress={(tab) => {
          if (activeTab !== tab) {
            router.push(`/(ortu)/${tab}` as any);
          }
        }} 
      />
    </View>
  );
}
