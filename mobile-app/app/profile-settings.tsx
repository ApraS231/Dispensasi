import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../src/utils/haptics';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import api from '../src/utils/api';
import SkeuCard from '../src/components/SkeuCard';
import BouncyButton from '../src/components/BouncyButton';
import AvatarInitials from '../src/components/AvatarInitials';
import { FONTS, SIZES, SPACING, GLASS } from '../src/utils/theme';
import { BlurView } from 'expo-blur';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTheme } from '../src/hooks/useTheme';
import { createCommonStyles } from '../src/utils/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import TopAppBar from '../src/components/TopAppBar';

export default function ProfileSettingsScreen() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [nis, setNis] = useState((user as any)?.siswa_profile?.nis || '');
  const [selectedKelasId, setSelectedKelasId] = useState((user as any)?.siswa_profile?.kelas_id || null);
  const [nidn, setNidn] = useState((user as any)?.nidn || '');
  const [showKelasPicker, setShowKelasPicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(user?.profile_photo_url || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { colors, shadows, isDark } = useTheme();
  const commonStyles = createCommonStyles(colors);

  // Fetch Classes
  const { data: kelasList = [] } = useQuery({
    queryKey: ['kelas-list'],
    queryFn: async () => {
      const { data } = await api.get('/kelas');
      return data;
    },
    enabled: user?.role === 'siswa'
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.nis) formData.append('nis', data.nis);
      if (data.kelas_id) formData.append('kelas_id', data.kelas_id);
      if (data.nidn) formData.append('nidn', data.nidn);

      const { data: response } = await api.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: (data) => {
      setUser(data.user);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui');
    },
    onError: (error: any) => {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await api.post('/profile/update-password', data);
      return response;
    },
    onSuccess: () => {
      Alert.alert('Berhasil', 'Password berhasil diperbarui');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (error: any) => {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan');
    }
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = () => {
    HapticFeedback.light();
    updateProfileMutation.mutate({ 
      name, 
      email, 
      nis, 
      kelas_id: selectedKelasId,
      nidn,
    });
  };

  const handleUpdatePassword = () => {
    HapticFeedback.medium();
    if (!currentPassword || !newPassword) {
      Alert.alert('Peringatan', 'Harap isi semua field password');
      return;
    }
    updatePasswordMutation.mutate({ current_password: currentPassword, new_password: newPassword });
  };

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          title="Pengaturan Profil" 
          onBack={() => router.back()} 
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <SkeuCard isGlass style={styles.card}>
            <View style={styles.avatarSection}>
              <TouchableOpacity /* onPress={pickImage} */ style={styles.avatarWrapper} activeOpacity={0.8}>
                <AvatarInitials name={user?.name || 'User'} size={80} fontSize={32} />
                <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.bgWhite }]}>
                  <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Data Pribadi</Text>
                <Text style={[styles.helperText, { color: colors.textMuted }]}>Ketuk foto untuk mengubah</Text>
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Lengkap</Text>
            <View style={[styles.inputWrapper, shadows.inset]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                value={name} 
                onChangeText={setName} 
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <View style={[styles.inputWrapper, shadows.inset]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {user?.role === 'siswa' && (
              <>
                <Text style={[styles.label, { color: colors.textSecondary }]}>NIS (Nomor Induk Siswa)</Text>
                <View style={[styles.inputWrapper, shadows.inset]}>
                  <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { color: colors.textPrimary }]} 
                    value={nis} 
                    onChangeText={setNis} 
                    placeholder="Masukkan NIS Anda"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Kelas</Text>
                <TouchableOpacity 
                  style={[styles.inputWrapper, shadows.inset]} 
                  onPress={() => setShowKelasPicker(!showKelasPicker)}
                >
                  <MaterialCommunityIcons name="google-classroom" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <Text style={[styles.input, { color: colors.textPrimary, textAlignVertical: 'center', paddingTop: 14 }]}>
                    {selectedKelasId 
                      ? kelasList.find((k: any) => k.id === selectedKelasId)?.nama_kelas 
                      : 'Pilih Kelas'}
                  </Text>
                  <MaterialCommunityIcons name={showKelasPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
                </TouchableOpacity>

                {showKelasPicker && (
                  <SkeuCard isGlass style={styles.dropdownCard}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {kelasList.map((kelas: any) => (
                        <TouchableOpacity 
                          key={kelas.id} 
                          style={[styles.dropdownItem, { borderBottomColor: colors.glassHighlight }]}
                          onPress={() => {
                            setSelectedKelasId(kelas.id);
                            setShowKelasPicker(false);
                            HapticFeedback.light();
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            { color: colors.textPrimary },
                            selectedKelasId === kelas.id && { color: colors.primary, fontFamily: FONTS.headingSemi }
                          ]}>
                            {kelas.nama_kelas}
                          </Text>
                          {selectedKelasId === kelas.id && (
                            <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </SkeuCard>
                )}
                <Text style={[styles.helperTextNote, { color: colors.textMuted }]}>* Perubahan kelas memerlukan persetujuan Wali Kelas.</Text>
              </>
            )}

            {['wali_kelas', 'guru_piket'].includes(user?.role || '') && (
              <>
                <Text style={[styles.label, { color: colors.textSecondary }]}>NIDN</Text>
                <View style={[styles.inputWrapper, shadows.inset]}>
                  <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { color: colors.textPrimary }]} 
                    value={nidn} 
                    onChangeText={setNidn} 
                    placeholder="Masukkan NIDN Anda"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Role</Text>
            <View style={[styles.inputWrapper, shadows.inset, { opacity: 0.6 }]}>
              <MaterialCommunityIcons name="shield-account-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                value={user?.role?.replace(/_/g, ' ') || ''} 
                editable={false} 
              />
            </View>
            
            <BouncyButton 
              title="Simpan Perubahan" 
              onPress={handleUpdateProfile} 
              loading={updateProfileMutation.isPending}
              style={styles.saveBtn}
            />
          </SkeuCard>

          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>Keamanan</Text>
          <SkeuCard style={styles.card} isGlass>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password Sekarang</Text>
            <View style={[styles.inputWrapper, shadows.inset]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                placeholder="Masukkan password lama" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Password Baru</Text>
            <View style={[styles.inputWrapper, shadows.inset]}>
              <MaterialCommunityIcons name="lock-reset" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: colors.textPrimary }]} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                placeholder="Masukkan password baru" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>

            <BouncyButton 
              title="Ganti Password" 
              onPress={handleUpdatePassword} 
              loading={updatePasswordMutation.isPending}
              style={styles.saveBtn}
            />
          </SkeuCard>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    marginBottom: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  helperText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  label: { 
    fontFamily: FONTS.headingSemi, 
    fontSize: 13, 
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.md,
    height: 55,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: SPACING.xl,
  },
  dropdownCard: {
    marginTop: SPACING.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 0.5,
  },
  dropdownItemText: {
    fontFamily: FONTS.body,
    fontSize: 14,
  },
  helperTextNote: {
    fontFamily: FONTS.body,
    fontSize: 11,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  }
});
