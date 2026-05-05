import { LinearGradient } from 'expo-linear-gradient';

export default function ChatBubble({ message, time, isMe, isPending, isFailed, onRetry, senderName, profilePhotoUrl }: ChatBubbleProps) {
  
  const innerContent = (
    <View style={[
      styles.bubbleWrapper,
      { 
        backgroundColor: isMe ? 'transparent' : COLORS.glassSurface,
        borderBottomRightRadius: isMe ? 4 : SIZES.radiusMd,
        borderBottomLeftRadius: isMe ? SIZES.radiusMd : 4,
        opacity: isPending ? 0.7 : 1,
      }
    ]}>
      {isMe && (
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {/* Gloss Highlight */}
      <View style={styles.glossHighlight} pointerEvents="none" />
      
      <Text style={[
        styles.message,
        { color: isMe ? COLORS.bgWhite : COLORS.textPrimary }
      ]}>{message}</Text>
    </View>
  );

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      {!isMe && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatar} />
            ) : (
              <AvatarInitials name={senderName || '?'} size={32} fontSize={14} />
            )}
          </View>
        </View>
      )}

      <View style={styles.contentContainer}>
        {isMe ? (
          <View style={[styles.raisedShadow, { alignSelf: 'flex-end' }]}>
            <View style={styles.bubbleOuter}>
              {innerContent}
            </View>
          </View>
        ) : (
          <View style={[styles.raisedShadow, { alignSelf: 'flex-start' }]}>
             <BlurView intensity={GLASS.blurIntensity + 10} tint={GLASS.tintColor} style={styles.bubbleOuter}>
               {innerContent}
             </BlurView>
          </View>
        )}

        <View style={[styles.metaData, isMe ? styles.metaRight : styles.metaLeft]}>
          {isFailed ? (
            <View style={styles.failedContainer}>
              <MaterialCommunityIcons name="alert-circle" size={12} color={COLORS.error} />
              <Text style={styles.failedText} onPress={onRetry}>Gagal. Tap untuk coba lagi</Text>
            </View>
          ) : (
            <View style={styles.metaRow}>
              <Text style={styles.time}>{time}</Text>
              {isMe && (
                <MaterialCommunityIcons 
                  name={isPending ? "clock-outline" : "check-all"} 
                  size={13} 
                  color={isPending ? COLORS.textMuted : COLORS.primary} 
                  style={styles.checkIcon} 
                />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import AvatarInitials from './AvatarInitials';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SIZES, GLASS, SPACING } from '../utils/theme';
import { BlurView } from 'expo-blur';

interface ChatBubbleProps {
  senderName?: string;
  profilePhotoUrl?: string | null;
  message: string;
  time: string;
  isMe: boolean;
  isPending?: boolean;
  isFailed?: boolean;
  onRetry?: () => void;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: 'row',
    maxWidth: '85%',
    paddingHorizontal: SPACING.md,
  },
  bubbleOuter: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  raisedShadow: {
    ...SHADOWS.raised,
    borderRadius: SIZES.radiusMd,
  },
  alignRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 10,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    ...SHADOWS.elevation2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  contentContainer: {
    flex: 1,
  },
  bubbleWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 60,
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  message: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  metaData: {
    marginTop: 4,
    marginHorizontal: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
