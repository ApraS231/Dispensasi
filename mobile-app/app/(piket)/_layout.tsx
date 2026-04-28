import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../src/utils/theme';

export default function PiketLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.primary,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan-qr"
        options={{
          href: null,
          title: 'Scan QR',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
