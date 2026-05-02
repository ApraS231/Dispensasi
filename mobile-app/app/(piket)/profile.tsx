import { HapticFeedback } from '../../src/utils/haptics';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import TopAppBar from '../../src/components/TopAppBar';
import SoftCard from '../../src/components/SoftCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function PiketProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    HapticFeedback.medium();
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const OptionMenu = ({ icon, label, onPress, isDanger = false }: { icon: string, label: string, onPress: () => void, isDanger?: boolean }) => (
    <TouchableOpacity style={styles.optionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.optionIconBox, isDanger && { backgroundColor: COLORS.errorBg }]}>
        <Text style={styles.optionIcon}>{icon}</Text>
      </View>
      <Text style={[styles.optionLabel, isDanger && { color: COLORS.error }]}>{label}</Text>
      <Text style={styles.optionChevron}>➔</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TopAppBar showAvatar={false} title="Profil Guru Piket" showNotification={true} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <AvatarInitials name={user?.name || 'Piket'} size={100} fontSize={40} />
            </View>
            <Text style={styles.name}>{user?.name || 'Nama Guru Piket'}</Text>
            <Text style={styles.email}>{user?.email || 'piket@sekolah.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.replace(/_/g, ' ') || 'Guru Piket'}</Text>
            </View>
          </View>

          <SoftCard style={styles.menuCard}>
            <Text style={styles.sectionTitle}>Pengaturan Akun</Text>
            <OptionMenu icon="O" label="Edit Profil & Pengaturan" onPress={() => expoRouter.push('/profile-settings' as any)} />
            <View style={styles.divider} />
            <OptionMenu icon="K" label="Ganti Password" onPress={() => expoRouter.push('/profile-settings' as any)} />
          </SoftCard>

          <BouncyButton title="Keluar / Logout" variant="danger" onPress={handleLogout} style={styles.logoutBtn} />
          <Text style={styles.versionText}>SiDispen App v1.0.0</Text>

        </ScrollView>

        
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  profileHeader: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.lg },
  avatarWrapper: {
    marginBottom: SPACING.md,
    ...SHADOWS.softCard,
    borderRadius: 50, backgroundColor: 'transparent', padding: 4 },
  name: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.textPrimary, marginBottom: 4 },
  email: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  roleBadge: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontFamily: FONTS.labelCaps, fontSize: 11, color: COLORS.onPrimary, textTransform: 'uppercase' },
  menuCard: { padding: SPACING.md, marginBottom: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.headingSemi, fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.md, marginLeft: SPACING.xs },
  divider: { height: 1, backgroundColor: COLORS.outlineVariant, marginVertical: SPACING.xs, opacity: 0.5 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xs },
  optionIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  optionIcon: { fontSize: 16 },
  optionLabel: { flex: 1, fontFamily: FONTS.headingSemi, fontSize: 15, color: COLORS.textPrimary },
  optionChevron: { fontFamily: FONTS.headingSemi, fontSize: 14, color: COLORS.textMuted, opacity: 0.5 },
  logoutBtn: { marginTop: SPACING.md },
  versionText: { fontFamily: FONTS.code, fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl, opacity: 0.5 }
});
