import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetTextInput 
} from '@gorhom/bottom-sheet';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../utils/theme';
import BouncyButton from './BouncyButton';
import { BlurView } from 'expo-blur';

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectModal({ visible, onClose, onSubmit }: RejectModalProps) {
  const [reason, setReason] = React.useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points: 50%
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
      setReason('');
    }
  }, [onClose]);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason('');
    bottomSheetRef.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="extend"
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Alasan Penolakan</Text>
        <Text style={styles.subtitle}>Pilih alasan atau masukkan catatan kustom:</Text>

        {/* Quick Reasons Chips */}
        <View style={styles.chipRow}>
          {['Dokumen Tidak Lengkap', 'Alasan Kurang Jelas', 'Jam Hampir Selesai', 'Data Tidak Sesuai'].map((chip) => (
            <TouchableOpacity 
              key={chip} 
              style={[styles.chip, reason === chip && styles.chipActive]} 
              onPress={() => setReason(chip)}
            >
              <Text style={[styles.chipText, reason === chip && styles.chipTextActive]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <BottomSheetTextInput
          style={[styles.input, SHADOWS.inset]}
          placeholder="Tulis alasan penolakan di sini..."
          placeholderTextColor={COLORS.textMuted}
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <View style={styles.actionRow}>
          <BouncyButton
            title="Batal"
            variant="tonal"
            onPress={() => bottomSheetRef.current?.close()}
            style={styles.btn}
          />
          <BouncyButton
            title="Kirim Penolakan"
            variant="danger"
            onPress={handleSubmit}
            style={styles.btn}
            disabled={!reason.trim()}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
  },
  indicator: {
    backgroundColor: COLORS.glassHighlight,
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.headingSemi,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.radiusMd,
    padding: SPACING.md,
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  chipActive: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.error,
  },
  chipText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.error,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  btn: {
    flex: 1,
  },
});
