import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../../src/utils/api';
import { FONTS, SIZES, SPACING, GLASS } from '../../src/utils/theme';
import { useTheme } from '../../src/hooks/useTheme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import BouncyButton from '../../src/components/BouncyButton';
import { useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { HapticFeedback } from '../../src/utils/haptics';
import * as SecureStore from 'expo-secure-store';

export default function LaporanIzinScreen() {
  const scrollY = useSharedValue(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { colors, isDark } = useTheme();

  const bulan = selectedDate.getMonth() + 1;
  const tahun = selectedDate.getFullYear();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wali-laporan-izin', bulan, tahun],
    queryFn: async () => {
      const { data } = await api.get('/wali/laporan-izin', {
        params: { bulan, tahun }
      });
      return data;
    }
  });

  const handlePrevMonth = () => {
    HapticFeedback.light();
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    HapticFeedback.light();
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const exportToPDF = async () => {
    if (!data || !data.siswa) return;
    
    HapticFeedback.medium();
    
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const fileName = `Laporan_Izin_${data.kelas.replace(/\s+/g, '_')}_${data.bulan_nama}_${tahun}.pdf`;
      const fileUri = (FileSystem.documentDirectory || 'file:///') + fileName;
      
      const downloadResult = await FileSystem.downloadAsync(
        `${process.env.EXPO_PUBLIC_API_URL}/wali/laporan-izin/pdf?bulan=${bulan}&tahun=${tahun}`,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
          }
        }
      );
      
      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Bagikan Laporan PDF'
          });
        } else {
          Alert.alert('Gagal', 'Fitur berbagi tidak tersedia di perangkat ini.');
        }
      } else {
        Alert.alert('Gagal', 'Gagal mengunduh file PDF dari server.');
      }
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      Alert.alert('Error', `Gagal membuat file PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const exportToCSV = async () => {
    if (!data || !data.siswa) return;
    
    HapticFeedback.medium();
    
    try {
      let csvContent = 'No,Nama,NIS,Sakit,Izin,Dispensasi,Total Izin,Disetujui,Ditolak,% Hadir\n';
      
      data.siswa.forEach((item: any, index: number) => {
        csvContent += `${index + 1},"${item.name}","${item.nis || '-'}",${item.sakit},${item.izin},${item.dispensasi},${item.total_izin},${item.disetujui},${item.ditolak},"${item.persen_hadir}%"\n`;
      });

      const fileName = `Laporan_Izin_${data.kelas.replace(/\s+/g, '_')}_${data.bulan_nama}_${tahun}.csv`;
      const fileUri = (FileSystem.documentDirectory || 'file:///') + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Bagikan Laporan Izin'
        });
      } else {
        Alert.alert('Gagal', 'Fitur berbagi tidak tersedia di perangkat ini.');
      }
    } catch (error: any) {
      console.error('CSV Export Error:', error);
      Alert.alert('Error', `Gagal membuat file CSV: ${error.message || 'Unknown error'}`);
    }
  };

  const getPercentageColor = (percent: number) => {
    if (percent >= 90) return colors.success;
    if (percent >= 75) return colors.warning;
    return colors.error;
  };

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          title="Laporan Persentase" 
          onBack={() => expoRouter.back()} 
          scrollY={scrollY}
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 88 + SPACING.statusBar }} />

          {/* Month Picker */}
          <AnimatedEntrance delay={100} direction="up">
            <SkeuCard isGlass style={{ marginBottom: SPACING.md, borderColor: colors.glassHighlight }}>
              <View style={styles.cardRow}>
                <TouchableOpacity onPress={handlePrevMonth} style={[styles.pickerBtn, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.monthInfo}>
                  <Text style={[styles.monthName, { color: colors.textPrimary }]}>{data?.bulan_nama || selectedDate.toLocaleString('id-ID', { month: 'long' })}</Text>
                  <Text style={[styles.yearName, { color: colors.textSecondary }]}>{tahun}</Text>
                </View>
                <TouchableOpacity onPress={handleNextMonth} style={[styles.pickerBtn, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </SkeuCard>
          </AnimatedEntrance>

          {/* Summary Card */}
          <AnimatedEntrance delay={200} direction="up">
            <SkeuCard isGlass style={{ marginBottom: SPACING.md, borderColor: colors.glassHighlight }}>
              <View style={[styles.cardRow, { justifyContent: 'space-around' }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Kelas</Text>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{data?.kelas || '-'}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.glassHighlight }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Hari Efektif</Text>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{data?.hari_efektif || 0} Hari</Text>
                </View>
              </View>
            </SkeuCard>
          </AnimatedEntrance>

          {/* Table */}
          <AnimatedEntrance delay={300} direction="up">
            <SkeuCard isGlass style={{ marginBottom: SPACING.lg, borderColor: colors.glassHighlight }}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.glassHighlight }]}>
                <Text style={[styles.headerText, { width: 25, color: colors.textSecondary }]}>No</Text>
                <Text style={[styles.headerText, { flex: 1, color: colors.textSecondary }]}>Nama Siswa</Text>
                <Text style={[styles.headerText, { width: 25, textAlign: 'center', color: colors.textSecondary }]}>S</Text>
                <Text style={[styles.headerText, { width: 25, textAlign: 'center', color: colors.textSecondary }]}>I</Text>
                <Text style={[styles.headerText, { width: 25, textAlign: 'center', color: colors.textSecondary }]}>D</Text>
                <Text style={[styles.headerText, { width: 35, textAlign: 'center', color: colors.textSecondary }]}>Tot</Text>
                <Text style={[styles.headerText, { width: 50, textAlign: 'right', color: colors.textSecondary }]}>% Hdr</Text>
              </View>

              {isLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: SPACING.xl }} />
              ) : data?.siswa?.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Tidak ada data siswa.</Text>
              ) : (
                data?.siswa.map((item: any, index: number) => (
                  <View key={item.id} style={[styles.tableRow, { borderBottomColor: colors.outlineVariant }]}>
                    <Text style={[styles.rowText, { width: 25, color: colors.textMuted, fontSize: 13 }]}>{index + 1}</Text>
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <Text style={[styles.studentName, { color: colors.textPrimary, fontSize: 14 }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.studentNis, { color: colors.textSecondary, fontSize: 10 }]}>NIS: {item.nis || '-'}</Text>
                    </View>
                    <Text style={[styles.rowText, { width: 25, textAlign: 'center', fontSize: 13, color: colors.textPrimary }]}>{item.sakit}</Text>
                    <Text style={[styles.rowText, { width: 25, textAlign: 'center', fontSize: 13, color: colors.textPrimary }]}>{item.izin}</Text>
                    <Text style={[styles.rowText, { width: 25, textAlign: 'center', fontSize: 13, color: colors.textPrimary }]}>{item.dispensasi}</Text>
                    <Text style={[styles.rowText, { width: 35, textAlign: 'center', fontSize: 13, fontFamily: FONTS.heading, color: colors.textPrimary }]}>{item.total_izin}</Text>
                    <View style={{ width: 50, alignItems: 'flex-end' }}>
                      <Text style={[styles.percentText, { fontSize: 13, color: getPercentageColor(item.percent_hadir || item.persen_hadir) }]}>
                        {item.percent_hadir || item.persen_hadir}%
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </SkeuCard>
          </AnimatedEntrance>

          {/* Action Button */}
          <AnimatedEntrance delay={400} direction="up">
            <View style={styles.actionSection}>
              <BouncyButton 
                title="Unduh Laporan PDF" 
                onPress={exportToPDF}
                icon="file-pdf-box"
                variant="primary"
                style={{ marginBottom: SPACING.md }}
                disabled={!data || data.siswa.length === 0}
              />
              <BouncyButton 
                title="Export ke Excel (CSV)" 
                onPress={exportToCSV}
                icon="file-export-outline"
                variant="outlined"
                disabled={!data || data.siswa.length === 0}
              />
              <Text style={[styles.footerNote, { color: colors.textMuted }]}>
                * S: Sakit, I: Izin, D: Dispensasi, Tot: Total Izin, % Hdr: Persentase Kehadiran.{"\n"}
                Persentase dihitung dari hari efektif (Senin-Jumat) dikurangi izin yang disetujui.
              </Text>
            </View>
          </AnimatedEntrance>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerBtn: {
    width: 34,
    height: 34,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthName: {
    fontFamily: FONTS.heading,
    fontSize: 21,
  },
  yearName: {
    fontFamily: FONTS.body,
    fontSize: 10,
  },

  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: '60%',
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  headerText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
  },
  rowText: {
    fontFamily: FONTS.body,
    fontSize: 16,
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
  },
  studentNis: {
    fontFamily: FONTS.body,
    fontSize: 10,
  },
  izinBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  izinCount: {
    fontFamily: FONTS.heading,
    fontSize: 16,
  },
  percentText: {
    fontFamily: FONTS.heading,
    fontSize: 16,
  },
  emptyText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },

  actionSection: {
    marginTop: SPACING.sm,
  },
  footerNote: {
    fontFamily: FONTS.body,
    fontSize: 10,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
