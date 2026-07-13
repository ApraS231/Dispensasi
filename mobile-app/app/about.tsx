import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import TopAppBar from '../src/components/TopAppBar';
import SkeuCard from '../src/components/SkeuCard';
import { useTheme } from '../src/hooks/useTheme';
import { createCommonStyles } from '../src/utils/commonStyles';
import { SPACING } from '../src/utils/theme';

export default function AboutScreen() {
  const { colors, isDark, SIZES, FONTS, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const features = [
    { icon: 'cellphone-text', title: 'Pengajuan Mandiri', desc: 'Siswa dan orang tua dapat mengajukan izin keluar/masuk sekolah secara mandiri dari mana saja.' },
    { icon: 'qrcode-scan', title: 'Validasi QR Instan', desc: 'Guru Piket dapat memvalidasi perizinan siswa di gerbang secara instan menggunakan pemindai QR Code.' },
    { icon: 'file-chart-outline', title: 'Laporan Riwayat', desc: 'Wali Kelas memantau tingkat kehadiran dan data izin siswa secara berkala demi kelancaran akademis.' },
    { icon: 'chat-processing-outline', title: 'Diskusi Interaktif', desc: 'Siswa dan guru dapat berdiskusi serta melampirkan berkas bukti secara langsung di dalam aplikasi.' },
  ];

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar title="Tentang Aplikasi" onBack={() => router.back()} />

        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { padding: SPACING.md }]} 
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 88 + SPACING.statusBar }} />

          {/* Logo & Version Card */}
          <SkeuCard isGlass style={styles.brandingCard}>
            <View style={styles.brandingContent}>
              <View style={[
                styles.logoWrapper, 
                { 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)',
                  borderColor: colors.glassHighlight,
                },
                shadows.elevation2
              ]}>
                <Image 
                  source={require('../assets/images/logo.png')} 
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
              <Text style={[styles.appName, { fontFamily: FONTS.heading, color: colors.primary }]}>
                Sistem Perizinan Siswa
              </Text>
              <Text style={[styles.appVersion, { fontFamily: FONTS.code, color: colors.textSecondary }]}>
                Versi 2.0.0 (Skeuo-Glass)
              </Text>
            </View>
          </SkeuCard>

          {/* Tujuan & Deskripsi */}
          <SkeuCard isGlass style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { fontFamily: FONTS.headingSemi, color: colors.textPrimary, marginBottom: SPACING.sm }]}>
              Tujuan & Fungsi
            </Text>
            <Text style={[styles.bodyText, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
              Aplikasi ini dikembangkan untuk mendigitalisasi dan mempermudah alur perizinan bagi siswa SMA Negeri 3 Bontang. 
              Sistem terintegrasi ini mempercepat koordinasi antara Siswa, Wali Kelas, Orang Tua, dan Guru Piket demi menjamin keselamatan, ketertiban, dan transparansi kegiatan siswa di luar kelas.
            </Text>
          </SkeuCard>

          {/* Fitur Utama List */}
          <Text style={[styles.listHeader, { fontFamily: FONTS.headingSemi, color: colors.textPrimary, paddingLeft: SPACING.xs, marginBottom: SPACING.sm }]}>
            Fitur Utama
          </Text>

          {features.map((feat, index) => (
            <SkeuCard key={index} isGlass style={styles.featureCard}>
              <View style={styles.featureRow}>
                <View style={[
                  styles.featureIconContainer,
                  { 
                    backgroundColor: colors.primaryContainer,
                    borderColor: colors.glassBorder,
                  }
                ]}>
                  <MaterialCommunityIcons name={feat.icon as any} size={22} color={isDark ? '#7BBDE8' : colors.primary} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={[styles.featureTitle, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>
                    {feat.title}
                  </Text>
                  <Text style={[styles.featureDesc, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
                    {feat.desc}
                  </Text>
                </View>
              </View>
            </SkeuCard>
          ))}

          {/* Footer Info */}
          <Text style={[styles.footerText, { fontFamily: FONTS.labelCaps, color: colors.textMuted, marginTop: SPACING.lg }]}>
            Dikembangkan Oleh SMAN 3 Bontang Digital Team
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 55,
  },
  brandingCard: {
    marginBottom: SPACING.md,
  },
  brandingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 21,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  logo: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 21,
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  listHeader: {
    fontSize: 16,
  },
  featureCard: {
    marginBottom: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.5,
  },
});
