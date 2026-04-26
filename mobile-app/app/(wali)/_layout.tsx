import { Stack } from 'expo-router';

export default function WaliLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#8B5CF6' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Wali Kelas' }} />
    </Stack>
  );
}
