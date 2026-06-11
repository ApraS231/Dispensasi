import { StatusBar, Platform } from 'react-native';

export const PHI = 1.618;

// === UNIVERSAL DESIGN TOKENS (Skeuo-Glass & Golden Ratio) ===

export const SPACING = {
  statusBar: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  xs: 8,
  sm: 13,    // 8 * PHI
  md: 21,    // 13 * PHI
  lg: 34,    // 21 * PHI
  xl: 55,    // 34 * PHI
  xxl: 89,   // 55 * PHI (added to avoid breakage where xxl was used)
};

export const SIZES = {
  radiusSm: 8,
  radius: 13,
  radiusMd: 13,
  radiusLg: 21,
  radiusXl: 34,
  radiusCard: 21,      // From design.md card specification
  radiusButton: 13,    // From design.md button specification
  radiusInput: 13,     // From design.md input specification
  radiusBadge: 8,
  radiusFull: 9999,
  radiusGlassPanel: 21,
  radiusToggle: 21,
};

export const FONTS = {
  heading: 'Roboto-Bold',
  headingSemi: 'Roboto-Medium',
  body: 'Roboto-Regular',
  bodyMedium: 'Roboto-Medium',
  labelCaps: 'Roboto-Medium',
  code: 'Roboto-Regular', 
};

// Typography presets following modular scale: 10, 16, 21, 26, 42
export const TYPOGRAPHY = {
  h1: { fontFamily: FONTS.heading, fontSize: 42, lineHeight: 50 },
  h2: { fontFamily: FONTS.headingSemi, fontSize: 26, lineHeight: 32 },
  h3: { fontFamily: FONTS.headingSemi, fontSize: 21, lineHeight: 28 },
  bodyLg: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 24 }, // mapped to 16
  labelCaps: { fontFamily: FONTS.labelCaps, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' as const },
  caption: { fontFamily: FONTS.body, fontSize: 10, lineHeight: 14 },
};

export const GLASS = {
  blurIntensity: 24, // Optimized from 30 to 24px as per design.md §4B
  tintColor: 'light' as const,
  opacity: 0.4, // Max alpha 0.4 as per design.md §1
};

// === THEME-SPECIFIC PALETTES ===

export const DARK_COLORS = {
  bgWhite: '#1A1A24',
  bgPrimary: '#1A1A24',
  bgSecondary: '#0D0D14',
  
  // Glass Specific (design.md §3B)
  glassSurface: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.45)',
  glassShadow: 'rgba(0, 0, 0, 0.6)',
  depthShadow: 'rgba(0, 0, 0, 0.6)',
  dropShadow: 'rgba(0, 0, 0, 0.35)',
  innerGlow: 'rgba(255, 255, 255, 0.15)',
  ambientLight: 'rgba(255, 255, 255, 0.05)',
  
  primaryLight: '#BDD8E9',
  primaryMuted: '#6B7A8D',
  
  primary: '#7BBDE8', // Readable blue on dark background
  onPrimary: '#0D0D14',
  primaryContainer: 'rgba(123, 189, 232, 0.15)',
  onPrimaryContainer: '#EAEEF3',
  
  secondary: '#9BA8B7',
  onSecondary: '#0D0D14',
  secondaryContainer: 'rgba(155, 168, 183, 0.15)',
  onSecondaryContainer: '#EAEEF3',

  tertiary: '#4E8EA2',
  onTertiary: '#0D0D14',
  tertiaryContainer: 'rgba(78, 142, 162, 0.15)',
  onTertiaryContainer: '#EAEEF3',
  
  // Semantic Colors
  textPrimary: '#EAEEF3',
  textSecondary: '#9BA8B7',
  textMuted: '#6B7A8D',
  outlineVariant: 'rgba(255, 255, 255, 0.2)',
  
  // Status Colors
  success: '#06D6A0',
  successBg: 'rgba(6, 214, 160, 0.15)',
  warning: '#FFD166',
  warningBg: 'rgba(255, 209, 102, 0.15)',
  error: '#EF476F',
  errorBg: 'rgba(239, 71, 111, 0.15)',
  info: '#7BBDE8',
  infoBg: 'rgba(123, 189, 232, 0.15)',
  
  // Input specific (design.md §4C)
  inputBg: 'rgba(0, 0, 0, 0.25)',
  inputBgFocused: 'rgba(0, 0, 0, 0.4)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBorderFocused: '#7BBDE8',
  inputFocusRing: 'rgba(123, 189, 232, 0.15)',

  // Inverse
  inverseSurface: '#EAEEF3',
  inverseOnSurface: '#0D0D14',

  // Backward compatibility mappings
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceDim: 'rgba(255, 255, 255, 0.04)',
  surfaceContainerLowest: 'rgba(255, 255, 255, 0.02)',
  surfaceContainerLow: 'rgba(255, 255, 255, 0.05)',
  surfaceContainer: 'rgba(255, 255, 255, 0.08)',
  surfaceContainerHigh: 'rgba(255, 255, 255, 0.12)',
  surfaceContainerHighest: 'rgba(255, 255, 255, 0.18)',
};

export const LIGHT_COLORS = {
  bgWhite: '#F0F4F8',
  bgPrimary: '#F0F4F8',
  bgSecondary: '#E6EEF4',
  
  // Glass Specific
  glassSurface: 'rgba(255, 255, 255, 0.35)',
  glassHighlight: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassShadow: 'rgba(0, 0, 0, 0.15)',
  depthShadow: 'rgba(0, 29, 57, 0.2)',
  dropShadow: 'rgba(0, 29, 57, 0.2)',
  innerGlow: 'rgba(255, 255, 255, 0.5)',
  ambientLight: 'rgba(123, 189, 232, 0.2)',
  
  primaryLight: '#7BBDE8',
  primaryMuted: '#6EA2B3',
  
  primary: '#0A4174', // Deep blue
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(10, 65, 116, 0.15)',
  onPrimaryContainer: '#001D39',
  
  secondary: '#49769F',
  onSecondary: '#FFFFFF',
  secondaryContainer: 'rgba(73, 118, 159, 0.15)',
  onSecondaryContainer: '#001D39',

  tertiary: '#4E8EA2',
  onTertiary: '#FFFFFF',
  tertiaryContainer: 'rgba(78, 142, 162, 0.15)',
  onTertiaryContainer: '#001D39',
  
  // Semantic Colors
  textPrimary: '#001D39',
  textSecondary: '#0A4174',
  textMuted: '#49769F',
  outlineVariant: 'rgba(255, 255, 255, 0.6)',
  
  // Status Colors
  success: '#06D6A0',
  successBg: 'rgba(6, 214, 160, 0.15)',
  warning: '#FFD166',
  warningBg: 'rgba(255, 209, 102, 0.15)',
  error: '#EF476F',
  errorBg: 'rgba(239, 71, 111, 0.15)',
  info: '#7BBDE8',
  infoBg: 'rgba(123, 189, 232, 0.15)',
  
  // Input specific
  inputBg: 'rgba(255, 255, 255, 0.6)',
  inputBgFocused: 'rgba(255, 255, 255, 0.95)',
  inputBorder: 'rgba(10, 65, 116, 0.15)',
  inputBorderFocused: '#0A4174',
  inputFocusRing: 'rgba(10, 65, 116, 0.15)',

  // Inverse
  inverseSurface: '#001D39',
  inverseOnSurface: '#BDD8E9',

  // Backward compatibility mappings
  surface: 'rgba(255, 255, 255, 0.25)',
  surfaceDim: 'rgba(255, 255, 255, 0.15)',
  surfaceContainerLowest: 'rgba(255, 255, 255, 0.8)',
  surfaceContainerLow: 'rgba(255, 255, 255, 0.6)',
  surfaceContainer: 'rgba(255, 255, 255, 0.4)',
  surfaceContainerHigh: 'rgba(255, 255, 255, 0.5)',
  surfaceContainerHighest: 'rgba(255, 255, 255, 0.7)',
};

// === HELPER FUNCTIONS ===

export function getColors(mode: 'light' | 'dark') {
  return mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

export function getShadows(mode: 'light' | 'dark') {
  const colors = getColors(mode);
  return {
    skeuShadow: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: mode === 'dark' ? 0.45 : 0.2,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 1.5,
      borderColor: colors.glassBorder,
    },
    glassPanel: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: mode === 'dark' ? 0.35 : 0.15,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.glassHighlight,
    },
    raised: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: mode === 'dark' ? 0.5 : 0.3,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: colors.glassHighlight,
    },
    inset: {
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderTopColor: mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
      borderLeftColor: mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
      borderBottomColor: colors.glassHighlight,
      borderRightColor: colors.glassHighlight,
      backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
    },
    elevation2: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: mode === 'dark' ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    elevation3: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: mode === 'dark' ? 0.3 : 0.12,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    embossedCard: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: mode === 'dark' ? 0.7 : 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    pressedCard: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: mode === 'dark' ? 0.5 : 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    toolbarShadow: {
      shadowColor: colors.depthShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: mode === 'dark' ? 0.5 : 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
  };
}

// === BACKWARD COMPATIBILITY EXPORTS ===
// Point to DARK_COLORS (the default theme according to design.md)
export const COLORS = DARK_COLORS;
export const SHADOWS = getShadows('dark');
