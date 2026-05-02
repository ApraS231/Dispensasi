import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import SoftCard from '../../src/components/SoftCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import PillBadge from '../../src/components/PillBadge';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

export default function PiketQueueScreen() {
  const { data: allTickets = [], isLoading: loading } = useQuery({
    queryKey: ['dispensasi-all'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi');
      return data;
    }
  });

  const tickets = allTickets.filter((t: any) =>
    (t.status === 'pending' || t.status === 'approved_by_wali') &&
    isToday(t.created_at)
  );


  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar showAvatar={false} title="Antrean Aktif" showNotification={true} />

        <View style={styles.mainContent}>
          <View style={styles.headerArea}>
            <Text style={styles.sectionTitle}>Menunggu Persetujuan</Text>
            <Text style={styles.sectionSub}>Tiket yang butuh validasi Anda hari ini.</Text>
          </View>

          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : (
              <FlatList
                data={tickets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const student = item.siswa;
                  const kelas = item.kelas?.nama_kelas || '-';
                  return (
                    <TouchableOpacity 
                      style={styles.queueCard} 
                      activeOpacity={0.8}
                      onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                    >
                      <SoftCard style={styles.cardInner}>
                        <View style={styles.studentInfo}>
                          <AvatarInitials name={student?.name || '?'} size={44} fontSize={18} />
                          <View style={styles.textStack}>
                            <Text style={styles.studentName}>{student?.name || 'Siswa'}</Text>
                            <Text style={styles.studentClass}>Kelas {kelas} • {item.jenis_izin.replace(/_/g, ' ')}</Text>
                          </View>
                          <PillBadge status={item.status} />
                        </View>
                        
                        <View style={styles.reasonBox}>
                          <Text style={styles.reasonText} numberOfLines={2}>{item.alasan}</Text>
                        </View>
                      </SoftCard>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada antrean tiket saat ini.</Text>}
              />
            )}
          </View>
        </View>

        
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  safeArea: { flex: 1 },
  mainContent: { flex: 1 },
  headerArea: { padding: SPACING.md, paddingBottom: 0 },
  sectionTitle: { fontFamily: FONTS.heading, fontSize: 22, color: COLORS.textPrimary },
  sectionSub: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  listContent: { paddingBottom: 100 },
  queueCard: { marginBottom: SPACING.md },
  cardInner: {
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: SIZES.radiusCard,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  textStack: { flex: 1, marginLeft: SPACING.sm, marginRight: SPACING.xs },
  studentName: { fontFamily: FONTS.headingSemi, fontSize: 16, color: COLORS.textPrimary },
  studentClass: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' },
  reasonBox: { backgroundColor: COLORS.surfaceContainerLow, padding: SPACING.sm, borderRadius: SIZES.radiusButton, borderWidth: 2, borderColor: 'transparent' },
  reasonText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
