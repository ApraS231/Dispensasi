import { Stack } from 'expo-router';

export default function PiketLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#3B82F6' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Guru Piket' }} />
    </Stack>
  );
}
