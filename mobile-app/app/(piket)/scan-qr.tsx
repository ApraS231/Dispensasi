import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useValidateQR } from '../../src/hooks/usePiketQueries';
import { FONTS, SPACING, SIZES, GLASS } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { ICONS } from '../../src/utils/icons';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const validateMutation = useValidateQR();
  const { colors, isDark } = useTheme();
  const commonStyles = createCommonStyles(colors);

  if (!permission) return <View style={commonStyles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>Kami membutuhkan akses kamera untuk memindai QR Code.</Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={[styles.permissionButtonText, { color: colors.onPrimary }]}>Beri Akses Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const res = await validateMutation.mutateAsync(data);
      Alert.alert("✅ BERHASIL", res.message, [
          { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("❌ DITOLAK", err.response?.data?.message || "Terjadi kesalahan saat memvalidasi QR.", [
          { text: "Coba Lagi", onPress: () => setTimeout(() => setScanned(false), 2000) }
      ]);
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <BlurView intensity={GLASS.blurIntensity} tint="dark" style={styles.backBtn}>
              <MaterialCommunityIcons name={ICONS.back} size={24} color="#FFFFFF" />
              <Text style={styles.backText}>Kembali</Text>
            </BlurView>
          </TouchableOpacity>
      </View>

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
            <BlurView intensity={GLASS.blurIntensity + 20} tint="dark" style={styles.instructionContainer}>
              <Text style={styles.instructionText}>Arahkan kamera ke QR Code di HP Siswa</Text>
            </BlurView>

            <View style={styles.scanAreaWrapper}>
                <View style={[styles.cornerTL, { borderColor: colors.primary }]} />
                <View style={[styles.cornerTR, { borderColor: colors.primary }]} />
                <View style={[styles.cornerBL, { borderColor: colors.primary }]} />
                <View style={[styles.cornerBR, { borderColor: colors.primary }]} />
                <View style={styles.scanArea} />
            </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius,
  },
  permissionButtonText: {
    fontFamily: FONTS.headingSemi,
  },
  header: {
      position: 'absolute',
      top: SPACING.statusBar + SPACING.sm,
      left: SPACING.md,
      zIndex: 10,
  },
  backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  backText: {
      color: '#FFFFFF',
      fontFamily: FONTS.headingSemi,
      marginLeft: 4,
  },
  overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  instructionContainer: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  instructionText: {
      color: '#FFFFFF',
      fontFamily: FONTS.headingSemi,
      fontSize: 14,
      textAlign: 'center',
  },
  scanAreaWrapper: {
      width: width * 0.7,
      height: width * 0.7,
      position: 'relative',
  },
  scanArea: {
      flex: 1,
      backgroundColor: 'transparent',
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
});
