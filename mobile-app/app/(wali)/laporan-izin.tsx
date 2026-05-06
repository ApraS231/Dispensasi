import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../../src/utils/api';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import BouncyButton from '../../src/components/BouncyButton';
import { useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { HapticFeedback } from '../../src/utils/haptics';

export default function LaporanIzinScreen() {
  const scrollY = useSharedValue(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const exportToCSV = async () => {
    if (!data || !data.siswa) return;
    
    HapticFeedback.medium();
    
    try {
      let csvContent = 'No,Nama,NIS,Sakit,Keluarga,Lainnya,Total Izin,Disetujui,Ditolak,% Hadir\n';
      
      data.siswa.forEach((item: any, index: number) => {
        csvContent += `${index + 1},"${item.name}","${item.nis || '-'}",${item.sakit},${item.keperluan_keluarga},${item.lainnya},${item.total_izin},${item.disetujui},${item.ditolak},"${item.persen_hadir}%"\n`;
      });

      const fileName = `Laporan_Izin_${data.kelas.replace(/\s+/g, '_')}_${data.bulan_nama}_${tahun}.csv`;
      const fileUri = (documentDirectory || 'file:///') + fileName;
      
      await writeAsStringAsync(fileUri, csvContent, { encoding: EncodingType.UTF8 });
      
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
    if (percent >= 90) return COLORS.success;
    if (percent >= 75) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
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
            <SkeuCard isGlass style={styles.monthPicker}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.pickerBtn}>
                <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.monthInfo}>
                <Text style={styles.monthName}>{data?.bulan_nama || selectedDate.toLocaleString('id-ID', { month: 'long' })}</Text>
                <Text style={styles.yearName}>{tahun}</Text>
              </View>
              <TouchableOpacity onPress={handleNextMonth} style={styles.pickerBtn}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </SkeuCard>
          </AnimatedEntrance>

          {/* Summary Card */}
          <AnimatedEntrance delay={200} direction="up">
            <SkeuCard isGlass style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Kelas</Text>
                <Text style={styles.summaryValue}>{data?.kelas || '-'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Hari Efektif</Text>
                <Text style={styles.summaryValue}>{data?.hari_efektif || 0} Hari</Text>
              </View>
            </SkeuCard>
          </AnimatedEntrance>

          {/* Table */}
          <AnimatedEntrance delay={300} direction="up">
            <SkeuCard isGlass style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, { width: 30 }]}>No</Text>
                <Text style={[styles.headerText, { flex: 1 }]}>Nama Siswa</Text>
                <Text style={[styles.headerText, { width: 40, textAlign: 'center' }]}>Izin</Text>
                <Text style={[styles.headerText, { width: 60, textAlign: 'right' }]}>% Hadir</Text>
              </View>

              {isLoading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
              ) : data?.siswa?.length === 0 ? (
                <Text style={styles.emptyText}>Tidak ada data siswa.</Text>
              ) : (
                data?.siswa.map((item: any, index: number) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.rowText, { width: 30, color: COLORS.textMuted }]}>{index + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.studentNis}>NIS: {item.nis || '-'}</Text>
                    </View>
                    <View style={[styles.izinBadge, { width: 40 }]}>
                      <Text style={styles.izinCount}>{item.total_izin}</Text>
                    </View>
                    <View style={{ width: 60, alignItems: 'flex-end' }}>
                      <Text style={[styles.percentText, { color: getPercentageColor(item.persen_hadir) }]}>
                        {item.persen_hadir}%
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
                title="Export ke Excel (CSV)" 
                onPress={exportToCSV}
                icon="file-export-outline"
                variant="primary"
                disabled={!data || data.siswa.length === 0}
              />
              <Text style={styles.footerNote}>* Persentase dihitung dari hari efektif (Senin-Jumat) dikurangi izin yang disetujui.</Text>
            </View>
          </AnimatedEntrance>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  pickerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthName: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  yearName: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  summaryCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    marginBottom: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.glassHighlight,
  },

  tableCard: {
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassHighlight,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  headerText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.glassHighlight + '40',
  },
  rowText: {
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  studentNis: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  izinBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  izinCount: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  percentText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
  },
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },

  actionSection: {
    marginTop: SPACING.sm,
  },
  footerNote: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
