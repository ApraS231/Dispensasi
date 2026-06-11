import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface TimelineNodeProps {
  title: string;
  time: string;
  description?: string;
  status: 'past' | 'current' | 'final' | 'rejected';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  isLast?: boolean;
}

export default function TimelineNode({ title, time, description, status, icon, isLast }: TimelineNodeProps) {
  const { colors, SIZES, SPACING, FONTS } = useTheme();

  const getStatusStyle = () => {
    switch (status) {
      case 'past':
        return { color: colors.success, line: colors.success, fill: colors.success };
      case 'final':
        return { color: colors.success, line: colors.success, fill: colors.success };
      case 'rejected':
        return { color: colors.error, line: colors.error, fill: colors.error };
      case 'current':
      default:
        return { color: colors.primary, line: colors.outlineVariant, fill: colors.bgWhite };
    }
  };

  const styleConfig = getStatusStyle();

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View
          style={[
            styles.bead,
            {
              borderColor: styleConfig.color,
              backgroundColor: styleConfig.fill,
              borderRadius: SIZES.radiusFull,
            },
            status === 'current' && { borderWidth: 3 },
          ]}
        >
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={14}
              color={status === 'current' ? styleConfig.color : colors.bgWhite}
            />
          )}
        </View>
        {!isLast && (
          <View style={[styles.line, { backgroundColor: styleConfig.line, marginVertical: SPACING.xs }]} />
        )}
      </View>

      <View
        style={[
          styles.content,
          { paddingLeft: SPACING.sm, paddingBottom: SPACING.xl },
          isLast && { paddingBottom: SPACING.sm },
        ]}
      >
        <View style={[styles.headerRow, { marginBottom: SPACING.xs }]}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: FONTS.headingSemi,
                fontSize: 16, // Modular scale text-body
                color: status === 'rejected' ? colors.error : status === 'current' ? colors.textPrimary : colors.textSecondary,
                paddingRight: SPACING.sm,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.time,
              {
                fontFamily: FONTS.code,
                fontSize: 10, // Modular scale text-caption
                color: colors.textMuted,
              },
            ]}
          >
            {time}
          </Text>
        </View>

        {description && (
          <Text
            style={[
              styles.description,
              {
                fontFamily: FONTS.bodyMedium,
                fontSize: 16, // Modular scale text-body
                color: status === 'rejected' ? colors.error : colors.textMuted,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 70,
  },
  leftCol: {
    width: 32,
    alignItems: 'center',
  },
  bead: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
  },
  time: {},
  description: {
    lineHeight: 18,
  },
});
