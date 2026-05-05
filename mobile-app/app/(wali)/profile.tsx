import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/stores/authStore';
import api from '../../src/utils/api';
import ProfileLayout from '../../src/components/ProfileLayout';
import OptionMenuItem from '../../src/components/OptionMenuItem';

export default function WaliProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const menuSections = [
    {
      title: "Manajemen Kelas",
      items: (
        <>
          <OptionMenuItem 
            icon="account-group-outline" 
            label="Data Siswa Kelas" 
            onPress={() => expoRouter.push('/(wali)/kelola-siswa')} 
          />
          <OptionMenuItem 
            icon="file-chart-outline" 
            label="Laporan Absensi" 
            onPress={() => {}} 
          />
        </>
      )
    },
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
      title="Profil Wali Kelas"
      userName={user?.name || 'Wali Kelas'}
      userEmail={user?.email || ''}
      userRole="Wali Kelas"
      sections={menuSections}
      onLogout={handleLogout}
    />
  );
}
