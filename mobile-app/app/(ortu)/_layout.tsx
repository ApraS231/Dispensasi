import { Stack } from 'expo-router';

export default function OrtuLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#10B981' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="dashboard" options={{ title: 'Monitoring Anak' }} />
    </Stack>
  );
}
