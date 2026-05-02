import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../utils/theme';
import BouncyButton from './BouncyButton';

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectModal({ visible, onClose, onSubmit }: RejectModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Alasan Penolakan</Text>
          <Text style={styles.subtitle}>Masukkan catatan penolakan yang akan dikirim ke siswa:</Text>

          <TextInput
            style={styles.input}
            placeholder="Alasan penolakan..."
            placeholderTextColor={COLORS.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            autoFocus
          />

          <View style={styles.actionRow}>
            <BouncyButton
              title="Batal"
              variant="tonal"
              onPress={() => { setReason(''); onClose(); }}
              style={styles.btn}
            />
            <BouncyButton
              title="Kirim Penolakan"
              variant="danger"
              onPress={handleSubmit}
              style={styles.btn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: SIZES.radiusXl,
    padding: SPACING.xl,
    width: '100%',
    ...SHADOWS.softCard,
      },
  title: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  input: {
        borderRadius: SIZES.radius,
    padding: SPACING.md,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  btn: {
    flex: 1,
  },
});
