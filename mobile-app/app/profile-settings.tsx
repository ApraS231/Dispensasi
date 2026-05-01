import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../src/utils/haptics';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import api from '../src/utils/api';
import SoftCard from '../src/components/SoftCard';
import BouncyButton from '../src/components/BouncyButton';
import AvatarInitials from '../src/components/AvatarInitials';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../src/utils/theme';

export default function ProfileSettingsScreen() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [photoUri, setPhotoUri] = useState<string | null>(user?.profile_photo_url || null);
  const { setUser } = useAuthStore();



  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    HapticFeedback.medium();
    setLoading(true);
    try {
      
      const formData = new FormData();
      if (name !== user?.name) formData.append('name', name);
      if (email !== user?.email) formData.append('email', email);
      if (oldPassword && newPassword) {
        formData.append('oldPassword', oldPassword);
        formData.append('newPassword', newPassword);
      }

      if (photoUri && photoUri !== user?.profile_photo_url) {
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('profile_photo', {
          uri: photoUri,
          name: filename,
          type
        } as any);
      }

      const response = await api.post('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUser(response.data.user);

      
      HapticFeedback.success();
      Alert.alert('Berhasil', 'Pengaturan profil telah diperbarui.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      HapticFeedback.error();
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan Akun</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <SoftCard style={styles.card}>

            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: 64, height: 64, borderRadius: 32 }} />
                ) : (
                  <AvatarInitials name={user?.name || 'User'} size={64} fontSize={24} />
                )}
                <View style={styles.editBadge}>
                  <MaterialCommunityIcons name="camera" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.sectionTitle}>Data Pribadi</Text>
                <Text style={styles.helperText}>Ketuk foto untuk mengubah</Text>
              </View>
            </View>

            
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.label}>Role</Text>
            <TextInput style={styles.input} value={user?.role?.replace(/_/g, ' ') || ''} editable={false} />
          </SoftCard>

          <SoftCard style={styles.card}>
            <Text style={styles.sectionTitle}>Ubah Password</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.helperText}>Biarkan kosong jika tidak ingin mengubah password.</Text>
            
              <Text style={styles.label}>Password Saat Ini</Text>
              <TextInput 
                style={styles.input} 
                value={oldPassword} 
                onChangeText={setOldPassword} 
                secureTextEntry
                placeholder="Masukkan password lama"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.label}>Password Baru</Text>
              <TextInput 
                style={styles.input} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry
                placeholder="Minimal 8 karakter"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </SoftCard>

          <BouncyButton 
            title={loading ? 'Menyimpan...' : 'Simpan Perubahan'} 
            onPress={handleSave} 
            loading={loading}
            style={styles.saveBtn}
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.statusBar + SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  backIcon: { fontSize: 18, color: COLORS.textPrimary, fontWeight: 'bold' },
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
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  avatarWrapper: {
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  inputGroup: {
    marginTop: SPACING.sm,
  },
  helperText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    marginTop: -8,
  },
  label: { 
    fontFamily: FONTS.headingSemi, 
    fontSize: 13, 
    color: COLORS.textSecondary, 
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.md,
    height: 48,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  saveBtn: {
    marginTop: SPACING.sm,
  }
});
