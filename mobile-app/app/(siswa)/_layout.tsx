import { Stack } from 'expo-router';

export default function SiswaLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#F59E0B' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard Siswa' }} />
      <Stack.Screen name="pengajuan" options={{ title: 'Ajukan Dispensasi' }} />
      <Stack.Screen name="qr/[id]" options={{ title: 'QR Code Dispensasi' }} />
    </Stack>
  );
}
