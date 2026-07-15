import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useTheme } from '../hooks/useTheme';
import BouncyButton from './BouncyButton';

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectModal({ visible, onClose, onSubmit }: RejectModalProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
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

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        setReason('');
      }
    },
    [onClose]
  );

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason('');
    bottomSheetRef.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );



  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.bgWhite,
        borderTopLeftRadius: SIZES.radiusXl,
        borderTopRightRadius: SIZES.radiusXl,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.glassHighlight,
        width: 40,
      }}
      keyboardBehavior="extend"
    >
      <BottomSheetView style={[styles.contentContainer, { padding: SPACING.lg }]}>
        <Text
          style={[
            styles.title,
            {
              fontFamily: FONTS.headingSemi,
              fontSize: 21, // Modular scale text-h3
              color: colors.textPrimary,
              marginBottom: SPACING.xs,
            },
          ]}
        >
          Alasan Penolakan
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              fontFamily: FONTS.bodyMedium,
              fontSize: 16, // Modular scale text-body
              color: colors.textSecondary,
              marginBottom: SPACING.md,
            },
          ]}
        >
          Pilih alasan atau masukkan catatan kustom:
        </Text>

        {/* Quick Reasons Chips */}
        <View style={[styles.chipRow, { marginBottom: SPACING.md }]}>
          {['Dokumen Tidak Lengkap', 'Alasan Kurang Jelas', 'Jam Hampir Selesai', 'Data Tidak Sesuai'].map((chip) => {
            const isActive = reason === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[
                  styles.chip,
                  {
                    borderRadius: SIZES.radiusLg, // 21px
                    paddingHorizontal: SPACING.sm, // 13px spacing-sm
                    paddingVertical: SPACING.xs, // 8px spacing-xs
                    backgroundColor: isActive ? colors.errorBg : colors.glassSurface,
                    borderColor: isActive ? colors.error : colors.glassBorder,
                  },
                ]}
                onPress={() => setReason(chip)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      fontFamily: FONTS.bodyMedium,
                      fontSize: 10, // Modular scale text-caption
                      color: isActive ? colors.error : colors.textSecondary,
                    },
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <BottomSheetTextInput
          style={[
            styles.input,
            shadows.inset,
            {
              backgroundColor: colors.inputBg || 'rgba(0, 0, 0, 0.25)',
              borderRadius: SIZES.radiusMd,
              padding: SPACING.md,
              fontFamily: FONTS.body,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: SPACING.lg,
            },
          ]}
          placeholder="Tulis alasan penolakan di sini..."
          placeholderTextColor={colors.textMuted}
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <View style={[styles.actionRow, { gap: SPACING.md }]}>
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
  contentContainer: {
    flex: 1,
  },
  title: {},
  subtitle: {},
  input: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
  },
  chipText: {},
  actionRow: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
  },
});
