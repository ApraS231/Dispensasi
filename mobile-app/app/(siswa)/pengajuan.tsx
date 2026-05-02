import { HapticFeedback } from '../../src/utils/haptics';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';
import { useSubmitDispensasi } from '../../src/hooks/useDispensasiQueries';

export default function PengajuanScreen() {
  const submitMutation = useSubmitDispensasi();

  const [jenisIzin, setJenisIzin] = useState('sakit');
  const [alasan, setAlasan] = useState('');
  
  // Date & Time states
  const [tanggal, setTanggal] = useState(new Date());
  const [waktuMulai, setWaktuMulai] = useState(new Date());
  const [waktuSelesai, setWaktuSelesai] = useState(new Date(Date.now() + 4 * 60 * 60 * 1000));
  
  // Picker visibility for Android
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showMulaiPicker, setShowMulaiPicker] = useState(Platform.OS === 'ios');
  const [showSelesaiPicker, setShowSelesaiPicker] = useState(Platform.OS === 'ios');

  const [loading, setLoading] = useState(false);
  const [lampiran, setLampiran] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const handlePickImage = async () => {
    HapticFeedback.light();
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Izin Ditolak", "Anda perlu memberikan izin untuk mengakses galeri.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setLampiran(result.assets[0]);
      HapticFeedback.success();
    }
  };

  const handleSubmit = async () => {
    if (!alasan.trim()) { Alert.alert('Perhatian', 'Alasan harus diisi.'); return; }
    
    setLoading(true);
    try {
      // Combine date and time
      const finalMulai = new Date(tanggal);
      finalMulai.setHours(waktuMulai.getHours(), waktuMulai.getMinutes(), 0, 0);
      
      const finalSelesai = new Date(tanggal);
      finalSelesai.setHours(waktuSelesai.getHours(), waktuSelesai.getMinutes(), 0, 0);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('jenis_izin', jenisIzin);
      formData.append('alasan', alasan);
      formData.append('waktu_mulai', finalMulai.toISOString());
      formData.append('waktu_selesai', finalSelesai.toISOString());

      if (lampiran) {
        const localUri = lampiran.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('lampiran_bukti', {
          uri: localUri,
          name: filename,
          type
        } as any);
      }

      await submitMutation.mutateAsync(formData);
      
      HapticFeedback.success();
      Alert.alert('Berhasil', 'Dispensasi berhasil diajukan!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      HapticFeedback.error();
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengajukan izin.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Navigation */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Form Pengajuan</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={COLORS.warning} style={{ marginRight: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Informasi Pengajuan</Text>
              <Text style={styles.infoText}>Dispensasi wajib disetujui oleh Wali Kelas sebelum dilanjutkan ke Guru Piket untuk mendapatkan QR Code.</Text>
            </View>
          </View>

          <View style={styles.glassCard}>
            
            <Text style={styles.label}>Jenis Izin</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={jenisIzin}
                onValueChange={(itemValue) => setJenisIzin(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Sakit" value="sakit" />
                <Picker.Item label="Keperluan Keluarga" value="keperluan_keluarga" />
                <Picker.Item label="Lainnya" value="lainnya" />
              </Picker>
            </View>

            <Text style={styles.label}>Tanggal Izin</Text>
            {Platform.OS === 'android' ? (
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{formatDate(tanggal)}</Text>
                <MaterialCommunityIcons name="calendar-month-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ) : null}
            {(showDatePicker || Platform.OS === 'ios') && (
              <DateTimePicker
                value={tanggal}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (selectedDate) setTanggal(selectedDate);
                }}
              />
            )}

            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Text style={styles.label}>Dari Jam</Text>
                {Platform.OS === 'android' ? (
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowMulaiPicker(true)}>
                    <Text style={styles.dateText}>{formatTime(waktuMulai)}</Text>
                  </TouchableOpacity>
                ) : null}
                {(showMulaiPicker || Platform.OS === 'ios') && (
                  <DateTimePicker
                    value={waktuMulai}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') setShowMulaiPicker(false);
                      if (selectedDate) setWaktuMulai(selectedDate);
                    }}
                  />
                )}
              </View>

              <View style={styles.timeCol}>
                <Text style={styles.label}>Sampai Jam</Text>
                {Platform.OS === 'android' ? (
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowSelesaiPicker(true)}>
                    <Text style={styles.dateText}>{formatTime(waktuSelesai)}</Text>
                  </TouchableOpacity>
                ) : null}
                {(showSelesaiPicker || Platform.OS === 'ios') && (
                  <DateTimePicker
                    value={waktuSelesai}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') setShowSelesaiPicker(false);
                      if (selectedDate) setWaktuSelesai(selectedDate);
                    }}
                  />
                )}
              </View>
            </View>

            <Text style={styles.label}>Alasan</Text>
            <TextInput 
              style={styles.textarea} 
              placeholder="Tuliskan alasan lengkap Anda..." 
              placeholderTextColor={COLORS.textMuted}
              value={alasan} 
              onChangeText={setAlasan} 
              multiline 
              numberOfLines={4} 
              textAlignVertical="top" 
            />

            <Text style={styles.label}>Lampiran Bukti (Opsional)</Text>
            <TouchableOpacity 
              style={[styles.uploadArea, lampiran && styles.uploadAreaSuccess]} 
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              {lampiran ? (
                <View style={styles.lampiranContainer}>
                  <Image source={{ uri: lampiran.uri }} style={styles.lampiranImg} />
                  <Text style={styles.uploadTextSuccess}>Ganti Foto</Text>
                </View>
              ) : (
                <>
                  <MaterialCommunityIcons name="camera-outline" size={28} color={COLORS.textMuted} style={{ marginBottom: SPACING.sm }} />
                  <Text style={styles.uploadText}>Ketuk untuk mengambil/memilih foto</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>{loading ? 'Mengirim...' : 'Kirim Pengajuan ➔'}</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  safeArea: { flex: 1 },
  headerBar: {
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
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: COLORS.textPrimary },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.primary,
  },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningBg,
    padding: SPACING.md,
    borderRadius: SIZES.radiusLg,
    marginBottom: SPACING.lg,
    ...SHADOWS.softCard,
  },
  infoTitle: { fontFamily: FONTS.headingSemi, fontSize: 14, color: COLORS.warning, marginBottom: 2 },
  infoText: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.warning, lineHeight: 18 },

  glassCard: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusCard,
    padding: SPACING.lg,
    ...SHADOWS.softCard,
  },

  label: { 
    fontFamily: FONTS.headingSemi, 
    fontSize: 14, 
    color: COLORS.textPrimary, 
    marginBottom: SPACING.sm, 
    marginTop: SPACING.md 
  },
  pickerContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.radiusButton,

    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  picker: {
    height: 50,
  },
  
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,

    borderRadius: SIZES.radiusButton,
    paddingHorizontal: SPACING.md,
    height: 50,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  dateText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  timeCol: {
    flex: 1,
  },

  textarea: { 
    backgroundColor: COLORS.surfaceContainerLow, 
    borderRadius: SIZES.radiusButton,

    padding: SPACING.md, 
    fontSize: 15, 
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    minHeight: 120,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  
  uploadArea: {

    borderStyle: 'dashed',
    borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAreaSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderStyle: 'solid',
    padding: SPACING.md,
  },
  uploadText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  uploadTextSuccess: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  lampiranContainer: {
    alignItems: 'center',
  },
  lampiranImg: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius,
  },

  submitBtn: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.softCard,
  },
  submitBtnText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.onPrimary,
    fontSize: 16,
    letterSpacing: 0.5,
  }
});
