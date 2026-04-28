import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS, FONTS } from '../src/utils/theme';

export default function IndexScreen() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
    } else {
      switch (user.role) {
        case 'siswa':
          router.replace('/(siswa)/dashboard');
          break;
        case 'guru_piket':
          router.replace('/(piket)/dashboard');
          break;
        case 'wali_kelas':
          router.replace('/(wali)/dashboard');
          break;
        case 'orang_tua':
          router.replace('/(ortu)/dashboard');
          break;
        default:
          router.replace('/login');
      }
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SiDispen</Text>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Memuat SiDispen...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 48,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  text: { 
    marginTop: 16, 
    fontSize: 14, 
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary 
  },
});
