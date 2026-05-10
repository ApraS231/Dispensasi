import { LinearGradient } from 'expo-linear-gradient';

export default function ChatBubble({ message, time, isMe, isPending, isFailed, onRetry, senderName, profilePhotoUrl, attachmentUrl, onImagePress }: ChatBubbleProps) {
  
  const innerContent = (
    <View style={[
      styles.bubbleWrapper,
      isMe ? styles.bubbleMe : styles.bubbleThem,
      { opacity: isPending ? 0.6 : 1 }
    ]}>
      {isMe && (
        <LinearGradient
          colors={['#0ea5e9', '#0284c7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {/* Glossy Overlay for "Me" messages */}
      {isMe && <View style={styles.glossHighlight} pointerEvents="none" />}
      
      {attachmentUrl && (
        <TouchableOpacity 
          style={styles.imageContainer} 
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
        <Text style={[
          styles.message,
          { 
            color: isMe ? COLORS.bgWhite : COLORS.textPrimary,
            marginTop: attachmentUrl ? 8 : 0,
            marginHorizontal: attachmentUrl ? 4 : 0,
          }
        ]}>{message}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      {!isMe && (
        <View style={styles.avatarWrapper}>
          {profilePhotoUrl ? (
            <Image source={{ uri: profilePhotoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
               <AvatarInitials name={senderName || '?'} size={32} fontSize={14} />
            </View>
          )}
        </View>
      )}

      <View style={styles.contentContainer}>
        {!isMe && senderName && (
          <Text style={styles.senderLabel}>{senderName}</Text>
        )}
        
        <View style={[styles.raisedShadow, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
           {isMe ? (
             <View style={styles.bubbleOuter}>
               {innerContent}
             </View>
           ) : (
             <BlurView intensity={GLASS.blurIntensity + 15} tint="light" style={styles.bubbleOuter}>
               {innerContent}
             </BlurView>
           )}
        </View>

        <View style={[styles.metaData, isMe ? styles.metaRight : styles.metaLeft]}>
          {isFailed ? (
            <TouchableOpacity style={styles.failedContainer} onPress={onRetry}>
              <MaterialCommunityIcons name="alert-circle" size={12} color={COLORS.error} />
              <Text style={styles.failedText}>Gagal dikirim. Tap untuk mengulang.</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.metaRow}>
              <Text style={styles.time}>{time}</Text>
              {isMe && (
                <MaterialCommunityIcons 
                  name={isPending ? "clock-outline" : "check-all"} 
                  size={13} 
                  color={isPending ? COLORS.textMuted : '#38bdf8'} 
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

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  attachmentUrl?: string | null;
  onImagePress?: (url: string) => void;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: 'row',
    maxWidth: '85%',
    paddingHorizontal: SPACING.md,
  },
  alignRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  alignLeft: { alignSelf: 'flex-start' },
  
  avatarWrapper: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.bgWhite },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  
  contentContainer: { flex: 1 },
  senderLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  bubbleOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  raisedShadow: {
    ...SHADOWS.elevation3,
    borderRadius: 18,
  },
  
  bubbleWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 60,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomLeftRadius: 4,
  },
  
  imageContainer: {
    borderRadius: 12,
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
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  
  metaData: { marginTop: 4, marginHorizontal: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaRight: { alignSelf: 'flex-end' },
  metaLeft: { alignSelf: 'flex-start' },
  time: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.textMuted },
  checkIcon: { marginLeft: 4 },
  
  failedContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  failedText: { fontFamily: FONTS.bodyMedium, fontSize: 10, color: COLORS.error },
});

