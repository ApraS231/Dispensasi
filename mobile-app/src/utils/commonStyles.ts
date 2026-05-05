import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from './theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    padding: SPACING.md,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
    fontSize: 14,
  },
});
