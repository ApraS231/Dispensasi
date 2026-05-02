import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { useValidateQR } from '../../src/hooks/usePiketQueries';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../../src/utils/theme';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const validateMutation = useValidateQR();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Kami membutuhkan akses kamera untuk memindai QR Code.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Beri Akses Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
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
    <View style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.bgWhite} />
            <Text style={styles.backText}>Kembali</Text>
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
            <Text style={styles.instructionText}>Arahkan kamera ke QR Code di HP Siswa</Text>

            <View style={styles.scanAreaWrapper}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                <View style={styles.scanArea} />
            </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  permissionText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius,
  },
  permissionButtonText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.onPrimary,
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
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
  },
  backText: {
      color: COLORS.bgWhite,
      fontFamily: FONTS.headingSemi,
      marginLeft: 4,
  },
  overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
  },
  instructionText: {
      color: COLORS.bgWhite,
      fontFamily: FONTS.headingSemi,
      fontSize: 16,
      marginBottom: SPACING.xl,
      textAlign: 'center',
      paddingHorizontal: SPACING.xl,
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
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary, borderTopLeftRadius: 16 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary, borderTopRightRadius: 16 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary, borderBottomLeftRadius: 16 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary, borderBottomRightRadius: 16 },
});
