import { StatusBar, Platform } from 'react-native';

export const COLORS = {
  // Neo-Brutalism Theme (Pleasant colors, high contrast borders)
  bgWhite: '#FDFBF7', // Warm off-white
  surface: '#FDFBF7',
  surfaceDim: '#F0EFEB',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F8F6F1',
  surfaceContainer: '#FDFBF7',
  surfaceContainerHigh: '#EAE8E2',
  surfaceContainerHighest: '#DCD9D1',
  
  primaryLight: '#FFB3B3',
  primaryMuted: '#FF8A8A',
  
  primary: '#FF6B6B', // Soft Red/Coral
  onPrimary: '#000000',
  primaryContainer: '#FFD93D', // Yellow/Gold
  onPrimaryContainer: '#000000',
  
  secondary: '#4ECDC4', // Teal/Mint
  onSecondary: '#000000',
  secondaryContainer: '#95E1D3', // Soft Teal
  onSecondaryContainer: '#000000',
  
  tertiary: '#FFE66D', // Yellow
  onTertiary: '#000000',
  tertiaryContainer: '#F7CA26',
  onTertiaryContainer: '#000000',
  
  // Semantic Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
  outlineVariant: '#1A1A1A', // Thick black outlines everywhere
  
  // Status Colors
  success: '#6BCB77',
  successBg: '#E8F6EA',
  warning: '#FFD93D',
  warningBg: '#FFFBE6',
  error: '#FF6B6B',
  errorBg: '#FFEFEF',
  info: '#4D96FF',
  infoBg: '#EAF2FF',
  
  // Inverse
  inverseSurface: '#1A1A1A',
  inverseOnSurface: '#FDFBF7',
};

export const FONTS = {
  heading: 'Roboto-Bold',
  headingSemi: 'Roboto-Bold', // Make semi-bold bold for brutalism
  body: 'Roboto-Medium', // Make body slightly bolder
  bodyMedium: 'Roboto-Bold',
  labelCaps: 'Roboto-Bold', 
  code: 'Roboto-Regular', 
};

// Typography presets
export const TYPOGRAPHY = {
  h1: { fontFamily: FONTS.heading, fontSize: 32, lineHeight: 40, color: COLORS.textPrimary },
  h2: { fontFamily: FONTS.headingSemi, fontSize: 24, lineHeight: 32, color: COLORS.textPrimary },
  h3: { fontFamily: FONTS.headingSemi, fontSize: 20, lineHeight: 28, color: COLORS.textPrimary },
  bodyLg: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 24, color: COLORS.textPrimary },
  bodyMd: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 20, color: COLORS.textPrimary },
  labelCaps: { fontFamily: FONTS.labelCaps, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' as const, color: COLORS.textPrimary },
};

export const SHADOWS = {
  softCard: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, // Might not look hard on android, but we'll use borders mostly
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  elevation2: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  elevation3: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
  bottomStrokePrimary: {
    borderBottomWidth: 4,
    borderBottomColor: '#1A1A1A',
    borderRightWidth: 2,
    borderRightColor: '#1A1A1A',
  },
  bottomStrokeSecondary: {},
  bottomStrokeTertiary: {},
  bottomStrokeError: {},
};

export const SIZES = {
  radiusSm: 0, // Sharp or very slightly rounded
  radius: 4,
  radiusMd: 6,
  radiusLg: 8,
  radiusXl: 12,
  radiusCard: 8, // Neo-brutalism usually has some slight radius or completely sharp
  radiusButton: 4, // Boxy buttons
  radiusBadge: 4,
  radiusFull: 9999, // keep for circles
};

export const SPACING = {
  statusBar: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  xs: 8,
  sm: 12,    
  md: 16,   
  lg: 24,   
  xl: 32,
  xxl: 48,
};
