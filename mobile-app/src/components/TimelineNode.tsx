import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../utils/theme';

interface TimelineNodeProps {
  title: string;
  time: string;
  description?: string;
  status: 'past' | 'current' | 'final' | 'rejected';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  isLast?: boolean;
}

export default function TimelineNode({ title, time, description, status, icon, isLast }: TimelineNodeProps) {
  const getStatusStyle = () => {
    switch(status) {
      case 'past':
        return { color: COLORS.success, line: COLORS.success, fill: COLORS.success };
      case 'final':
        return { color: COLORS.success, line: COLORS.success, fill: COLORS.success };
      case 'rejected':
        return { color: COLORS.error, line: COLORS.error, fill: COLORS.error };
      case 'current':
      default:
        return { color: COLORS.primary, line: COLORS.outlineVariant, fill: COLORS.bgWhite };
    }
  };

  const styleConfig = getStatusStyle();

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={[
          styles.bead, 
          { borderColor: styleConfig.color, backgroundColor: styleConfig.fill },
          status === 'current' && { borderWidth: 3 }
        ]}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={14} 
              color={status === 'current' ? styleConfig.color : COLORS.bgWhite} 
            />
          )}
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: styleConfig.line }]} />}
      </View>
      
      <View style={[styles.content, isLast && styles.contentLast]}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.title, 
            (status === 'current' || status === 'rejected') && styles.titleHighlight,
            status === 'rejected' && { color: COLORS.error }
          ]}>
            {title}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        
        {description && (
          <Text style={[
            styles.description,
            status === 'rejected' && { color: COLORS.error }
          ]}>{description}</Text>
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
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  contentLast: {
    paddingBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  titleHighlight: {
    color: COLORS.textPrimary,
  },
  time: {
    fontFamily: FONTS.code,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  description: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  }
});
