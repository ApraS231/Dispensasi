import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES } from '../utils/theme';

interface ChatBubbleProps {
  message: string;
  time: string;
  isMe: boolean;
  isPending?: boolean;
  isFailed?: boolean;
  onRetry?: () => void;
}

export default function ChatBubble({ message, time, isMe, isPending, isFailed, onRetry }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      <View style={[
        styles.bubbleWrapper,
        { 
          backgroundColor: isMe ? COLORS.primaryContainer : COLORS.surfaceContainerHighest,
          borderBottomRightRadius: isMe ? 0 : SIZES.radiusCard,
          borderBottomLeftRadius: isMe ? SIZES.radiusCard : 0,
          opacity: isPending ? 0.6 : 1,
          borderWidth: 2,
          borderColor: '#1A1A1A',
          shadowColor: '#1A1A1A',
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }
      ]}>
        <Text style={[
          styles.message,
          { color: isMe ? COLORS.onPrimaryContainer : COLORS.textPrimary }
        ]}>{message}</Text>
      </View>
      <View style={[styles.metaData, isMe ? styles.metaRight : styles.metaLeft]}>
        {isFailed ? (
          <View style={styles.failedContainer}>
            <MaterialCommunityIcons name="alert-circle" size={12} color={COLORS.error} />
            <Text style={styles.failedText} onPress={onRetry}>Tap untuk coba lagi</Text>
          </View>
        ) : (
          <>
            <Text style={styles.time}>{time}</Text>
            {isMe && !isPending && (
              <MaterialCommunityIcons name="check-all" size={14} color={COLORS.textMuted} style={styles.checkIcon} />
            )}
            {isMe && isPending && (
              <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.textMuted} style={styles.checkIcon} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  bubbleWrapper: {
    borderRadius: SIZES.radiusCard,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  message: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginHorizontal: 8,
  },
  metaRight: {
    alignSelf: 'flex-end',
  },
  metaLeft: {
    alignSelf: 'flex-start',
  },
  time: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  checkIcon: {
    marginLeft: 4,
  },
  failedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  failedText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.error,
    marginLeft: 4,
  }
});
