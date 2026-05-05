import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/stores/authStore';
import api from '../../src/utils/api';
import ProfileLayout from '../../src/components/ProfileLayout';
import OptionMenuItem from '../../src/components/OptionMenuItem';

import GlassFAB from '../../src/components/GlassFAB';
import { HapticFeedback } from '../../src/utils/haptics';

export default function SiswaProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const menuSections = [
    {
      title: "Pengaturan Utama",
      items: (
        <>
          <OptionMenuItem 
            icon="account-cog-outline" 
            label="Pengaturan Akun" 
            onPress={() => expoRouter.push('/profile-settings')} 
          />
          <OptionMenuItem 
            icon="account-heart-outline" 
            label="Permintaan Orang Tua" 
            onPress={() => expoRouter.push('/(siswa)/parent-requests')} 
          />
          <OptionMenuItem 
            icon="bell-outline" 
            label="Notifikasi" 
            onPress={() => expoRouter.push('/notifications')} 
          />
        </>
      )
    },
    {
      title: "Dukungan",
      items: (
        <>
          <OptionMenuItem 
            icon="help-circle-outline" 
            label="Pusat Bantuan" 
            onPress={() => {}} 
          />
          <OptionMenuItem 
            icon="information-outline" 
            label="Tentang Aplikasi" 
            onPress={() => {}} 
          />
        </>
      )
    }
  ];

  return (
    <ProfileLayout
      title="Profil Siswa"
      userName={user?.name || 'Siswa'}
      userEmail={user?.email || ''}
      userRole="Siswa"
      sections={menuSections}
      onLogout={handleLogout}
      fab={
        <GlassFAB 
          onPress={() => {
            HapticFeedback.light();
            expoRouter.push('/(siswa)/pengajuan');
          }}
          bottom={110}
        />
      }
    />
  );
}
