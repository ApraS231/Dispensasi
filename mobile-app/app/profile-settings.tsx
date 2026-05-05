import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../src/utils/haptics';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import api from '../src/utils/api';
import SkeuCard from '../src/components/SkeuCard';
import BouncyButton from '../src/components/BouncyButton';
import AvatarInitials from '../src/components/AvatarInitials';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../src/utils/theme';
import LiquidBackground from '../src/components/LiquidBackground';
import { BlurView } from 'expo-blur';
import { useMutation } from '@tanstack/react-query';

export default function ProfileSettingsScreen() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUri, setPhotoUri] = useState<string | null>(user?.profile_photo_url || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await api.post('/profile/update', data);
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
    updateProfileMutation.mutate({ name, email, profile_photo: photoUri });
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
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Navigation */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <BlurView intensity={GLASS.blurIntensity} tint={GLASS.tintColor} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.textPrimary} />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan Profil</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <SkeuCard isGlass style={styles.card}>
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                ) : (
                  <AvatarInitials name={user?.name || 'User'} size={80} fontSize={32} />
                )}
                <View style={styles.editBadge}>
                  <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.sectionTitle}>Data Pribadi</Text>
                <Text style={styles.helperText}>Ketuk foto untuk mengubah</Text>
              </View>
            </View>

            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={[styles.inputWrapper, SHADOWS.inset]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, SHADOWS.inset]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <Text style={styles.label}>Role</Text>
            <View style={[styles.inputWrapper, SHADOWS.inset, { opacity: 0.6 }]}>
              <MaterialCommunityIcons name="shield-account-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
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

          <Text style={styles.sectionHeader}>Keamanan</Text>
          <SkeuCard style={styles.card} isGlass>
            <Text style={styles.label}>Password Sekarang</Text>
            <View style={[styles.inputWrapper, SHADOWS.inset]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                placeholder="Masukkan password lama" 
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>

            <Text style={styles.label}>Password Baru</Text>
            <View style={[styles.inputWrapper, SHADOWS.inset]}>
              <MaterialCommunityIcons name="lock-reset" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                placeholder="Masukkan password baru" 
                placeholderTextColor={COLORS.textMuted}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: SIZES.radiusButton,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.bgWhite,
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
    color: COLORS.textMuted,
  },
  label: { 
    fontFamily: FONTS.headingSemi, 
    fontSize: 13, 
    color: COLORS.textSecondary, 
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassSurface,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.md,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  saveBtn: {
    marginTop: SPACING.xl,
  }
});
