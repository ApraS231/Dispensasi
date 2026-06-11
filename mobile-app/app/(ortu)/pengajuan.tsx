import { HapticFeedback } from '../../src/utils/haptics';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { FONTS, SIZES, SPACING, GLASS } from '../../src/utils/theme';
import { useSubmitDispensasi } from '../../src/hooks/useDispensasiQueries';
import { BlurView } from 'expo-blur';
import BouncyButton from '../../src/components/BouncyButton';
import SkeuCard from '../../src/components/SkeuCard';
import { compressImage } from '../../src/utils/imageHelper';
import TopAppBar from '../../src/components/TopAppBar';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/utils/api';
import { useTheme } from '../../src/hooks/useTheme';
import { createCommonStyles } from '../../src/utils/commonStyles';

export default function OrtuPengajuanScreen() {
  const submitMutation = useSubmitDispensasi();
  const { colors, shadows, isDark } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
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

  // Fetch children list
  const { data: children = [] } = useQuery({
    queryKey: ['ortu-children'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/children');
      return data;
    }
  });

  // Set default child if list loaded
  React.useEffect(() => {
    if (children.length > 0 && !selectedSiswaId) {
      setSelectedSiswaId(children[0].id);
    }
  }, [children]);

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
      quality: 1,
    });

    if (!result.canceled) {
      const originalUri = result.assets[0].uri;
      const compressedUri = await compressImage(originalUri);
      
      setLampiran({
        ...result.assets[0],
        uri: compressedUri
      });
      HapticFeedback.success();
    }
  };

  const handleSubmit = async () => {
    if (!selectedSiswaId) { Alert.alert('Perhatian', 'Pilih anak terlebih dahulu.'); return; }
    if (!alasan.trim()) { Alert.alert('Perhatian', 'Alasan harus diisi.'); return; }
    
    setLoading(true);
    try {
      const finalMulai = new Date(tanggal);
      finalMulai.setHours(waktuMulai.getHours(), waktuMulai.getMinutes(), 0, 0);
      
      const finalSelesai = new Date(tanggal);
      finalSelesai.setHours(waktuSelesai.getHours(), waktuSelesai.getMinutes(), 0, 0);

      const formData = new FormData();
      formData.append('siswa_id', selectedSiswaId);
      formData.append('jenis_izin', jenisIzin);
      formData.append('alasan', alasan);
      formData.append('waktu_mulai', finalMulai.toISOString());
      formData.append('waktu_selesai', finalSelesai.toISOString());

      if (lampiran) {
        const localUri = lampiran.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('foto_bukti', {
          uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
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
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          title="Ajukan Izin Anak" 
          onBack={() => router.back()} 
        />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ height: 88 + SPACING.statusBar }} />
        
        <SkeuCard isGlass style={styles.glassCard}>
          {/* Info Banner Inline */}
          <View style={[
            styles.infoBannerInline, 
            { 
              backgroundColor: isDark ? 'rgba(123, 189, 232, 0.08)' : 'rgba(10, 65, 116, 0.05)',
              borderColor: isDark ? 'rgba(123, 189, 232, 0.15)' : 'rgba(10, 65, 116, 0.1)',
            }
          ]}>
            <MaterialCommunityIcons name="information" size={20} color={colors.primary} style={{ marginRight: SPACING.sm, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: colors.primary }]}>Pengajuan Orang Tua</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>Anda dapat mengajukan izin atas nama anak Anda. Tetap diperlukan persetujuan Wali Kelas.</Text>
            </View>
          </View>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Pilih Anak</Text>
          <View style={[styles.pickerContainer, shadows.inset]}>
            <Picker
              selectedValue={selectedSiswaId}
              onValueChange={(itemValue) => setSelectedSiswaId(itemValue)}
              style={[styles.picker, { color: colors.textPrimary }]}
              dropdownIconColor={colors.textPrimary}
            >
              {children.map((child: any) => (
                <Picker.Item key={child.id} label={child.name} value={child.id} color={isDark ? '#FFFFFF' : '#001D39'} style={{ backgroundColor: colors.bgPrimary }} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Jenis Izin</Text>
          <View style={[styles.pickerContainer, shadows.inset]}>
            <Picker
              selectedValue={jenisIzin}
              onValueChange={(itemValue) => setJenisIzin(itemValue)}
              style={[styles.picker, { color: colors.textPrimary }]}
              dropdownIconColor={colors.textPrimary}
            >
              <Picker.Item label="Sakit" value="sakit" color={isDark ? '#FFFFFF' : '#001D39'} style={{ backgroundColor: colors.bgPrimary }} />
              <Picker.Item label="Izin" value="izin" color={isDark ? '#FFFFFF' : '#001D39'} style={{ backgroundColor: colors.bgPrimary }} />
              <Picker.Item label="Dispensasi" value="dispensasi" color={isDark ? '#FFFFFF' : '#001D39'} style={{ backgroundColor: colors.bgPrimary }} />
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Tanggal Izin</Text>
          {Platform.OS === 'android' ? (
            <TouchableOpacity style={[styles.dateInput, shadows.inset]} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>{formatDate(tanggal)}</Text>
              <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.textSecondary} />
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
              <Text style={[styles.label, { color: colors.textSecondary }]}>Dari Jam</Text>
              {Platform.OS === 'android' ? (
                <TouchableOpacity style={[styles.dateInput, shadows.inset]} onPress={() => setShowMulaiPicker(true)}>
                  <Text style={[styles.dateText, { color: colors.textPrimary }]}>{formatTime(waktuMulai)}</Text>
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
              <Text style={[styles.label, { color: colors.textSecondary }]}>Sampai Jam</Text>
              {Platform.OS === 'android' ? (
                <TouchableOpacity style={[styles.dateInput, shadows.inset]} onPress={() => setShowSelesaiPicker(true)}>
                  <Text style={[styles.dateText, { color: colors.textPrimary }]}>{formatTime(waktuSelesai)}</Text>
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

          <Text style={[styles.label, { color: colors.textSecondary }]}>Alasan</Text>
          <TextInput 
            style={[styles.textarea, shadows.inset, { color: colors.textPrimary, borderColor: colors.glassHighlight }]} 
            placeholder="Tuliskan alasan lengkap Anda..." 
            placeholderTextColor={colors.textMuted}
            value={alasan} 
            onChangeText={setAlasan} 
            multiline 
            numberOfLines={4} 
            textAlignVertical="top" 
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Lampiran Bukti (Opsional)</Text>
          <TouchableOpacity 
            style={[
              styles.uploadArea, 
              lampiran ? styles.uploadAreaSuccess : null, 
              shadows.inset, 
              { borderColor: lampiran ? colors.primary : colors.textMuted }
            ]} 
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            {lampiran ? (
              <View style={styles.lampiranContainer}>
                <Image source={{ uri: lampiran.uri }} style={[styles.lampiranImg, { borderColor: colors.bgWhite }]} />
                <Text style={[styles.uploadTextSuccess, { color: colors.primary }]}>Ganti Foto</Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="camera-outline" size={28} color={colors.textMuted} style={{ marginBottom: SPACING.sm }} />
                <Text style={[styles.uploadText, { color: colors.textMuted }]}>Ketuk untuk mengambil/memilih foto</Text>
              </>
            )}
          </TouchableOpacity>

          <BouncyButton
            title={loading ? 'Mengirim...' : 'Kirim Pengajuan ➔'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />

        </SkeuCard>
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  infoBannerInline: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  infoTitle: { fontFamily: FONTS.headingSemi, fontSize: 14, marginBottom: 2 },
  infoText: { fontFamily: FONTS.bodyMedium, fontSize: 12, lineHeight: 18 },
  glassCard: { marginBottom: SPACING.md },
  label: { fontFamily: FONTS.headingSemi, fontSize: 14, marginBottom: SPACING.sm, marginTop: SPACING.md },
  pickerContainer: { borderRadius: SIZES.radiusMd, overflow: 'hidden' },
  picker: { height: 50 },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: SIZES.radiusMd, paddingHorizontal: SPACING.md, height: 52 },
  dateText: { fontFamily: FONTS.bodyMedium, fontSize: 15 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md },
  timeCol: { flex: 1 },
  textarea: { borderRadius: SIZES.radiusMd, padding: SPACING.md, fontSize: 15, fontFamily: FONTS.body, minHeight: 100 },
  uploadArea: { borderRadius: SIZES.radiusMd, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1 },
  uploadAreaSuccess: { padding: SPACING.md, borderStyle: 'solid', borderWidth: 1 },
  uploadText: { fontFamily: FONTS.headingSemi, fontSize: 13 },
  uploadTextSuccess: { fontFamily: FONTS.headingSemi, marginTop: SPACING.sm },
  lampiranContainer: { alignItems: 'center' },
  lampiranImg: { width: 120, height: 120, borderRadius: SIZES.radiusMd, borderWidth: 2 },
  submitBtn: { marginTop: SPACING.xl },
});
