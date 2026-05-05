import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import SkeuCard from '../../src/components/SkeuCard';
import LiquidBackground from '../../src/components/LiquidBackground';
import AvatarInitials from '../../src/components/AvatarInitials';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import { COLORS, FONTS, SIZES, SPACING } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { useSharedValue } from 'react-native-reanimated';

export default function PiketQueueScreen() {
  const scrollY = useSharedValue(0);

  const { data: queue = [], isLoading, refetch } = useQuery({
    queryKey: ['dispensasi-piket-queue'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/piket/queue');
      return data;
    }
  });

  const renderHeader = () => (
    <View style={commonStyles.mainContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      <View style={commonStyles.headerContainer}>
        <AnimatedEntrance delay={300} direction="down">
          <Text style={styles.title}>Antrean Keluar</Text>
          <Text style={styles.subtitle}>Siswa yang sudah disetujui dan siap keluar sekolah.</Text>
        </AnimatedEntrance>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <SafeAreaView style={commonStyles.safeArea}>
        <TopAppBar 
          title="Antrean Piket" 
          showAvatar={false} 
          showNotification={false} 
          scrollY={scrollY}
          onBack={() => expoRouter.back()}
        />

        <RefreshableFlatList
          data={queue}
          keyExtractor={(item: any) => item.id}
          refreshing={isLoading}
          onRefresh={refetch}
          scrollY={scrollY}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={commonStyles.listContent}
          renderItem={({ item, index }: any) => (
            <View style={{ paddingHorizontal: SPACING.md }}>
              <AnimatedEntrance delay={400 + (index * 100)} direction="up" offset={20}>
                <TouchableOpacity onPress={() => expoRouter.push(`/ticket/${item.id}`)}>
                  <SkeuCard isGlass style={styles.ticketCard}>
                    <View style={styles.cardHeader}>
                      <AvatarInitials name={item.siswa?.name || '?'} size={40} fontSize={16} />
                      <View style={styles.meta}>
                        <Text style={styles.studentName}>{item.siswa?.name || 'Siswa'}</Text>
                        <Text style={styles.studentClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <TicketCard item={item} />
                  </SkeuCard>
                </TouchableOpacity>
              </AnimatedEntrance>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={commonStyles.emptyText}>Tidak ada antrean saat ini.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ticketCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  meta: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  studentClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusBadge,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.success,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
});
