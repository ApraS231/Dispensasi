import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TopAppBar from '../src/components/TopAppBar';
import SkeuCard from '../src/components/SkeuCard';
import { useTheme } from '../src/hooks/useTheme';
import { useAuthStore } from '../src/stores/authStore';
import { SPACING } from '../src/utils/theme';

interface Step {
  number: string;
  title: string;
  description: string;
}

interface RoleGuide {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  steps: Step[];
}

const roleGuides: Record<'siswa' | 'orang_tua' | 'wali_kelas' | 'guru_piket', RoleGuide> = {
  siswa: {
    title: 'Siswa',
    icon: 'account-outline',
    steps: [
      {
        number: '01',
        title: 'Ajukan Izin Baru',
        description: 'Ketuk tombol tambah "+" terapung (FAB) di dashboard Anda. Isi formulir perizinan mulai dari Jenis Izin, Detail Alasan, Tanggal/Jam Mulai & Selesai, serta unggah dokumen/foto bukti pendukung.',
      },
      {
        number: '02',
        title: 'Persetujuan Orang Tua',
        description: 'Setelah dikirim, orang tua Anda akan mendapatkan notifikasi. Mereka harus membuka aplikasi dan menyetujui pengajuan izin tersebut terlebih dahulu.',
      },
      {
        number: '03',
        title: 'Validasi Wali Kelas',
        description: 'Setelah disetujui orang tua, pengajuan dilanjutkan ke Wali Kelas. Wali Kelas akan meninjau dan memberikan persetujuan akhir agar status tiket menjadi aktif.',
      },
      {
        number: '04',
        title: 'Tunjukkan QR Code ke Piket',
        description: 'Buka tiket perizinan yang telah disetujui di tab "Riwayat/Izin". Tunjukkan QR Code perizinan tersebut ke Guru Piket di gerbang sekolah untuk dipindai saat keluar/masuk.',
      },
    ],
  },
  orang_tua: {
    title: 'Orang Tua',
    icon: 'account-heart-outline',
    steps: [
      {
        number: '01',
        title: 'Hubungkan Akun Anak',
        description: 'Masuk ke menu profil Anda, pilih tab "Kelola Anak", lalu daftarkan NISN anak Anda agar akun orang tua dan akun siswa saling terhubung.',
      },
      {
        number: '02',
        title: 'Terima Notifikasi Izin',
        description: 'Setiap kali anak Anda membuat pengajuan perizinan/izin, Anda akan otomatis menerima notifikasi pengajuan masuk di perangkat Anda.',
      },
      {
        number: '03',
        title: 'Tinjau & Validasi Izin',
        description: 'Buka aplikasi, periksa alasan dan durasi izin anak Anda. Ketuk tombol "Setujui" atau "Tolak" dengan melampirkan catatan persetujuan.',
      },
      {
        number: '04',
        title: 'Pantau Kehadiran & Riwayat',
        description: 'Lihat daftar riwayat perizinan anak Anda secara real-time untuk memastikan transparansi absensi dan memonitor keamanan anak di luar sekolah.',
      },
    ],
  },
  wali_kelas: {
    title: 'Wali Kelas',
    icon: 'account-tie-outline',
    steps: [
      {
        number: '01',
        title: 'Notifikasi Persetujuan',
        description: 'Anda akan menerima pemberitahuan setiap ada siswa di kelas bimbingan Anda yang pengajuan izinnya telah disetujui oleh orang tua mereka.',
      },
      {
        number: '02',
        title: 'Verifikasi Berkas Pendukung',
        description: 'Tinjau detail alasan pengajuan perizinan beserta foto bukti dokumen (misal: surat dokter/undangan kegiatan) yang dilampirkan oleh siswa.',
      },
      {
        number: '03',
        title: 'Validasi Akhir',
        description: 'Ketuk tombol "Setujui" untuk merilis tiket perizinan digital siswa, atau "Tolak" disertai alasan penolakan jika perizinan dinilai kurang valid.',
      },
      {
        number: '04',
        title: 'Pantau Laporan Absensi',
        description: 'Gunakan fitur laporan absensi kelas untuk memantau akumulasi data ketidakhadiran dan perizinan siswa bimbingan Anda secara berkala.',
      },
    ],
  },
  guru_piket: {
    title: 'Guru Piket',
    icon: 'qrcode-scan',
    steps: [
      {
        number: '01',
        title: 'Buka Pemindai QR',
        description: 'Ketuk tombol Scan QR Code terapung (FAB) di dashboard petugas piket untuk membuka kamera pemindai perizinan.',
      },
      {
        number: '02',
        title: 'Pindai QR Siswa',
        description: 'Arahkan kamera ke QR Code perizinan yang dibawa siswa di gerbang sekolah. Sistem akan otomatis memuat detail pengajuan secara langsung.',
      },
      {
        number: '03',
        title: 'Validasi Log Gerbang',
        description: 'Konfirmasi kecocokan foto dan data perizinan di layar, lalu ketuk tombol "Validasi Keluar" atau "Validasi Masuk" untuk mencatat jam persis absensi.',
      },
      {
        number: '04',
        title: 'Input Kode Alternatif',
        description: 'Apabila QR Code rusak atau tidak terbaca oleh kamera, gunakan opsi input manual dan ketikkan kode unik tiket perizinan yang tertera di bawah QR Code.',
      },
    ],
  },
};

export default function HelpScreen() {
  const { colors, isDark, SIZES, FONTS, shadows } = useTheme();
  const { user } = useAuthStore();

  // Map user role to local guide keys
  const getInitialRole = (): keyof typeof roleGuides => {
    const role = user?.role;
    if (role === 'siswa') return 'siswa';
    if (role === 'orang_tua') return 'orang_tua';
    if (role === 'wali_kelas') return 'wali_kelas';
    if (role === 'guru_piket') return 'guru_piket';
    return 'siswa'; // default fallback
  };

  const currentRole = getInitialRole();

  const getRoleNameInIndonesian = (role: string) => {
    switch (role) {
      case 'siswa': return 'Siswa';
      case 'orang_tua': return 'Orang Tua';
      case 'wali_kelas': return 'Wali Kelas';
      case 'guru_piket': return 'Guru Piket';
      default: return 'Pengguna';
    }
  };

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar title="Pusat Bantuan" onBack={() => router.back()} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: SPACING.md }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 88 + SPACING.statusBar }} />

          {/* User Role Banner */}
          <SkeuCard isGlass style={styles.bannerCard}>
            <View style={styles.bannerContent}>
              <View style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.primaryContainer,
                  borderColor: colors.glassHighlight,
                }
              ]}>
                <MaterialCommunityIcons name="shield-account-outline" size={24} color={isDark ? '#7BBDE8' : colors.primary} />
              </View>
              <View style={styles.bannerTextCol}>
                <Text style={[styles.bannerTitle, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>
                  Panduan Pengguna
                </Text>
                <Text style={[styles.bannerSub, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
                  Peran Anda saat ini: <Text style={{ fontFamily: FONTS.headingSemi, color: colors.primary }}>{getRoleNameInIndonesian(user?.role || 'siswa')}</Text>
                </Text>
              </View>
            </View>
          </SkeuCard>

          {/* Guide Steps */}
          <View style={styles.stepsWrapper}>
            <Text style={[styles.roleGuideTitle, { fontFamily: FONTS.headingSemi, color: colors.textPrimary, paddingLeft: SPACING.xs }]}>
              Langkah Penggunaan ({roleGuides[currentRole].title})
            </Text>

            {roleGuides[currentRole].steps.map((step, idx) => (
              <SkeuCard key={idx} isGlass style={styles.stepCard}>
                <View style={styles.stepRow}>
                  {/* Step Number Badge */}
                  <View style={[
                    styles.stepBadge,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      borderColor: colors.glassBorder,
                    }
                  ]}>
                    <Text style={[styles.stepNumText, { fontFamily: FONTS.code, color: colors.primary }]}>
                      {step.number}
                    </Text>
                  </View>

                  {/* Step Info */}
                  <View style={styles.stepTextCol}>
                    <Text style={[styles.stepTitle, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.stepDesc, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
                      {step.description}
                    </Text>
                  </View>
                </View>
              </SkeuCard>
            ))}
          </View>

          {/* Contact Support Card */}
          <SkeuCard isGlass style={styles.supportCard}>
            <View style={styles.supportRow}>
              <MaterialCommunityIcons name="face-agent" size={28} color={isDark ? '#7BBDE8' : colors.primary} />
              <View style={styles.supportTextCol}>
                <Text style={[styles.supportTitle, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>
                  Butuh Bantuan Lain?
                </Text>
                <Text style={[styles.supportDesc, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
                  Hubungi tim IT SMA Negeri 3 Bontang jika Anda mengalami masalah teknis atau akun terblokir.
                </Text>
              </View>
            </View>
          </SkeuCard>

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
  bannerCard: {
    marginBottom: SPACING.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 13,
  },
  stepsWrapper: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  roleGuideTitle: {
    fontSize: 15,
    marginBottom: SPACING.xs,
  },
  stepCard: {
    marginBottom: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  stepBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  supportCard: {
    marginTop: SPACING.sm,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: SPACING.xs,
  },
  supportTextCol: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  supportDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
