import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import SkeuCard from '../../src/components/SkeuCard';
import LiquidBackground from '../../src/components/LiquidBackground';
import { COLORS, FONTS, SPACING } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';

export default function WaliQueueScreen() {
  const { data: queue, isLoading } = useQuery({
    queryKey: ['dispensasi-wali-queue'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/pending');
      return data;
    }
  });

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <SafeAreaView style={commonStyles.safeArea}>
        <TopAppBar showAvatar={false} title="Antrean Persetujuan" showNotification={true} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ height: 88 + SPACING.statusBar }} />
          <SkeuCard isGlass style={styles.infoCard}>
            <Text style={styles.infoText}>Daftar pengajuan izin dari siswa Anda yang memerlukan persetujuan wali kelas.</Text>
          </SkeuCard>

          <View style={commonStyles.sectionHeader}>
            <Text style={commonStyles.sectionTitle}>Menunggu ({queue?.length || 0})</Text>
          </View>

          {queue?.map((item: any) => (
            <TicketCard 
              key={item.id} 
              item={item} 
              showName={true}
              onPress={() => expoRouter.push(`/ticket/${item.id}`)} 
            />
          ))}

          {(!queue || queue.length === 0) && !isLoading && (
            <Text style={commonStyles.emptyText}>Tidak ada antrean persetujuan saat ini.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  infoCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
