import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/stores/authStore';
import api from '../../src/utils/api';
import ProfileLayout from '../../src/components/ProfileLayout';
import OptionMenuItem from '../../src/components/OptionMenuItem';

export default function PiketProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const menuSections = [
    {
      title: "Pengaturan Akun",
      items: (
        <>
          <OptionMenuItem 
            icon="account-cog-outline" 
            label="Pengaturan Profil" 
            onPress={() => expoRouter.push('/profile-settings')} 
          />
          <OptionMenuItem 
            icon="bell-outline" 
            label="Notifikasi" 
            onPress={() => expoRouter.push('/notifications')} 
          />
        </>
      )
    }
  ];

  return (
    <ProfileLayout
      title="Profil Petugas"
      userName={user?.name || 'Petugas Piket'}
      userEmail={user?.email || ''}
      userRole="Guru Piket"
      sections={menuSections}
      onLogout={handleLogout}
    />
  );
}
