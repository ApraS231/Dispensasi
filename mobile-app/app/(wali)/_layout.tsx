import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import BottomTabBar, { WALI_TABS } from '../../src/components/BottomTabBar';

export default function WaliLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.split('/').pop() || 'dashboard';

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'simple_push',
        contentStyle: { backgroundColor: 'transparent' } 
      }}>
        <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
        <Stack.Screen name="queue" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="kelola-siswa" />
      </Stack>
      
      {!pathname.includes('kelola-siswa') && (
        <BottomTabBar 
          tabs={WALI_TABS} 
          activeTab={activeTab} 
          onTabPress={(tab) => {
            if (activeTab !== tab) {
              router.push(`/(wali)/${tab}` as any);
            }
          }} 
        />
      )}
    </View>
  );
}
