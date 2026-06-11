import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AvatarInitials from './AvatarInitials';
import { useTheme } from '../hooks/useTheme';

interface ChatBubbleProps {
  senderName?: string;
  profilePhotoUrl?: string | null;
  message: string;
  time: string;
  isMe: boolean;
  isPending?: boolean;
  isFailed?: boolean;
  onRetry?: () => void;
  attachmentUrl?: string | null;
  onImagePress?: (url: string) => void;
}

export default function ChatBubble({
  message,
  time,
  isMe,
  isPending,
  isFailed,
  onRetry,
  senderName,
  profilePhotoUrl,
  attachmentUrl,
  onImagePress,
}: ChatBubbleProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();

  const bubbleBorderRadiusStyle = {
    borderTopLeftRadius: SIZES.radiusCard,
    borderTopRightRadius: SIZES.radiusCard,
    borderBottomLeftRadius: isMe ? SIZES.radiusCard : 4,
    borderBottomRightRadius: isMe ? 4 : SIZES.radiusCard,
  };

  // Rich high-contrast gradients for "Me" bubble
  const meGradientColors = isDark
    ? ['#7BBDE8', '#4E8EA2'] as const
    : ['#0A4174', '#1E5A90'] as const;

  const textColor = isMe
    ? (isDark ? '#0D0D14' : '#FFFFFF')
    : colors.textPrimary;

  const innerContent = (
    <View
      style={[
        styles.bubbleWrapper,
        isMe ? styles.bubbleMe : styles.bubbleThem,
        { opacity: isPending ? 0.6 : 1 },
      ]}
    >
      {isMe && (
        <LinearGradient
          colors={meGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Glossy Overlay for "Me" messages */}
      {isMe && <View style={styles.glossHighlight} pointerEvents="none" />}

      {attachmentUrl && (
        <TouchableOpacity
          style={[styles.imageContainer, { borderRadius: SIZES.radius }]}
          onPress={() => onImagePress?.(attachmentUrl)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: attachmentUrl }}
            style={styles.attachmentImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)']}
            style={StyleSheet.absoluteFill}
          />
        </TouchableOpacity>
      )}

      {message ? (
        <Text
          style={[
            styles.message,
            {
              fontFamily: FONTS.body,
              fontSize: 16, // Modular scale text-body
              color: textColor,
              marginTop: attachmentUrl ? SPACING.xs : 0,
              marginHorizontal: attachmentUrl ? 4 : 0,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.alignRight : styles.alignLeft,
        { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
      ]}
    >
      {!isMe && (
        <View style={[styles.avatarWrapper, { marginRight: SPACING.xs, marginBottom: SPACING.sm }]}>
          {profilePhotoUrl ? (
            <Image
              source={{ uri: profilePhotoUrl }}
              style={[
                styles.avatar,
                { borderColor: colors.bgWhite, borderRadius: SIZES.radiusFull },
              ]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderRadius: SIZES.radiusFull }]}>
              <AvatarInitials name={senderName || '?'} size={32} fontSize={10} />
            </View>
          )}
        </View>
      )}

      <View style={styles.contentContainer}>
        {!isMe && senderName && (
          <Text
            style={[
              styles.senderLabel,
              {
                fontFamily: FONTS.bodyMedium,
                fontSize: 10, // Modular scale text-caption
                color: colors.textMuted,
              },
            ]}
          >
            {senderName}
          </Text>
        )}

        <View
          style={[
            shadows.raised,
            {
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              ...bubbleBorderRadiusStyle,
            },
          ]}
        >
          {isMe ? (
            <View
              style={[
                styles.bubbleOuter,
                {
                  ...bubbleBorderRadiusStyle,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              {innerContent}
            </View>
          ) : (
            <BlurView
              intensity={24} // design.md blur(24px)
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.bubbleOuter,
                {
                  ...bubbleBorderRadiusStyle,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              {innerContent}
            </BlurView>
          )}
        </View>

        <View style={[styles.metaData, isMe ? styles.metaRight : styles.metaLeft]}>
          {isFailed ? (
            <TouchableOpacity style={styles.failedContainer} onPress={onRetry}>
              <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
              <Text
                style={[
                  styles.failedText,
                  { fontFamily: FONTS.bodyMedium, fontSize: 10, color: colors.error },
                ]}
              >
                Gagal dikirim. Tap untuk mengulang.
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.metaRow}>
              <Text style={[styles.time, { fontFamily: FONTS.body, fontSize: 10, color: colors.textMuted }]}>
                {time}
              </Text>
              {isMe && (
                <MaterialCommunityIcons
                  name={isPending ? 'clock-outline' : 'check-all'}
                  size={13}
                  color={isPending ? colors.textMuted : isDark ? '#7BBDE8' : '#0A4174'}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    maxWidth: '85%',
  },
  alignRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  alignLeft: { alignSelf: 'flex-start' },

  avatarWrapper: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    overflow: 'hidden',
  },

  contentContainer: { flex: 1 },
  senderLabel: {
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bubbleOuter: {
    overflow: 'hidden',
    borderWidth: 1,
  },

  bubbleWrapper: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    minWidth: 60,
  },
  bubbleMe: {
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  imageContainer: {
    overflow: 'hidden',
    marginHorizontal: -6,
    marginTop: -2,
  },
  attachmentImage: {
    width: 220,
    height: 160,
  },

  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  message: {
    lineHeight: 20,
  },

  metaData: { marginTop: 4, marginHorizontal: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaRight: { alignSelf: 'flex-end' },
  metaLeft: { alignSelf: 'flex-start' },
  time: {},
  checkIcon: { marginLeft: 4 },

  failedContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  failedText: {},
});
