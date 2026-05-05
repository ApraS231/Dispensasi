import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { COLORS, FONTS, SIZES, SPACING } from '../../src/utils/theme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import { useSharedValue } from 'react-native-reanimated';

export default function ParentRequestsScreen() {
  const scrollY = useSharedValue(0);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['siswa-parent-requests'],
    queryFn: async () => {
      const { data } = await api.get('/siswa/parent-requests');
      return data;
    }
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string, status: 'accepted' | 'rejected' }) => {
      return await api.post(`/siswa/parent-requests/${requestId}/respond`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['siswa-parent-requests'] });
      const msg = variables.status === 'accepted' ? 'Permintaan diterima.' : 'Permintaan ditolak.';
      Alert.alert('Berhasil', msg);
    },
    onError: (error: any) => {
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal menanggapi permintaan.');
    }
  });

  const handleRespond = (requestId: string, status: 'accepted' | 'rejected', parentName: string) => {
    const action = status === 'accepted' ? 'menerima' : 'menolak';
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${action} permintaan dari ${parentName}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: status === 'accepted' ? 'Terima' : 'Tolak', 
          style: status === 'accepted' ? 'default' : 'destructive',
          onPress: () => respondMutation.mutate({ requestId, status }) 
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.cardWrapper}>
      <AnimatedEntrance delay={100 + index * 100} direction="up">
        <SkeuCard isGlass style={styles.requestCard}>
          <View style={styles.cardHeader}>
            <AvatarInitials name={item.parent?.name} size={50} />
            <View style={styles.headerInfo}>
              <Text style={styles.parentName}>{item.parent?.name}</Text>
              <Text style={styles.requestText}>Ingin terhubung sebagai Orang Tua/Wali Anda.</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <BouncyButton 
              title="Tolak" 
              onPress={() => handleRespond(item.id, 'rejected', item.parent?.name)}
              variant="danger"
              style={styles.actionBtn}
              loading={respondMutation.isPending && respondMutation.variables?.requestId === item.id && respondMutation.variables?.status === 'rejected'}
            />
            <BouncyButton 
              title="Terima" 
              onPress={() => handleRespond(item.id, 'accepted', item.parent?.name)}
              variant="primary"
              style={styles.actionBtn}
              loading={respondMutation.isPending && respondMutation.variables?.requestId === item.id && respondMutation.variables?.status === 'accepted'}
            />
          </View>
        </SkeuCard>
      </AnimatedEntrance>
    </View>
  );

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <TopAppBar 
          title="Permintaan Orang Tua" 
          onBack={() => expoRouter.back()} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollY={scrollY}
          ListHeaderComponent={<View style={{ height: 88 + SPACING.statusBar }} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <AnimatedEntrance delay={300} direction="up">
                  <View style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account-heart-outline" size={80} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>Tidak Ada Permintaan</Text>
                    <Text style={styles.emptySubtitle}>Saat ini tidak ada permintaan hubungan akun yang tertunda.</Text>
                  </View>
                </AnimatedEntrance>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  cardWrapper: { marginBottom: SPACING.md },
  requestCard: {
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  parentName: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  requestText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
