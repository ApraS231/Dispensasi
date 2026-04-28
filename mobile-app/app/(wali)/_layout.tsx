import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { WALI_TABS } from '../../src/components/BottomTabBar';

export default function WaliLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.split('/').pop() || 'dashboard';

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="queue" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
      </Stack>
      
      <BottomTabBar 
        tabs={WALI_TABS} 
        activeTab={activeTab} 
        onTabPress={(tab) => {
          if (activeTab !== tab) {
            router.push(`/(wali)/${tab}` as any);
          }
        }} 
      />
    </View>
  );
}
