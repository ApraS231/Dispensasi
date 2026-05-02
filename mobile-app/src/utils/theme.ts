import { StatusBar, Platform } from 'react-native';

export const COLORS = {
  // Skeuomorphism & Liquid Glass Theme
  bgWhite: '#F0F4F8', // Slightly cool off-white for glass contrast
  surface: 'rgba(255, 255, 255, 0.4)', // Translucent glass surface
  surfaceDim: 'rgba(255, 255, 255, 0.2)',
  surfaceContainerLowest: 'rgba(255, 255, 255, 0.8)',
  surfaceContainerLow: 'rgba(255, 255, 255, 0.6)',
  surfaceContainer: 'rgba(255, 255, 255, 0.5)',
  surfaceContainerHigh: 'rgba(255, 255, 255, 0.7)',
  surfaceContainerHighest: 'rgba(255, 255, 255, 0.9)',
  
  primaryLight: '#FFA1B2',
  primaryMuted: '#FF87A0',
  
  primary: '#FF4D6D', // Vibrant but soft red
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(255, 77, 109, 0.15)', // Glassy primary
  onPrimaryContainer: '#D90429',
  
  secondary: '#00B4D8', // Bright blue
  onSecondary: '#FFFFFF',
  secondaryContainer: 'rgba(0, 180, 216, 0.15)',
  onSecondaryContainer: '#0077B6',
  
  tertiary: '#FFD166', // Warm yellow
  onTertiary: '#000000',
  tertiaryContainer: 'rgba(255, 209, 102, 0.2)',
  onTertiaryContainer: '#D99000',
  
  // Semantic Colors
  textPrimary: '#2B2D42',
  textSecondary: '#8D99AE',
  textMuted: '#A0AABF',
  outlineVariant: 'rgba(255, 255, 255, 0.6)', // White highlight for glass edge
  
  // Status Colors
  success: '#06D6A0',
  successBg: 'rgba(6, 214, 160, 0.15)',
  warning: '#FFD166',
  warningBg: 'rgba(255, 209, 102, 0.15)',
  error: '#EF476F',
  errorBg: 'rgba(239, 71, 111, 0.15)',
  info: '#118AB2',
  infoBg: 'rgba(17, 138, 178, 0.15)',
  
  // Inverse
  inverseSurface: '#2B2D42',
  inverseOnSurface: '#F0F4F8',
};

export const FONTS = {
  heading: 'Roboto-Bold',
  headingSemi: 'Roboto-Medium',
  body: 'Roboto-Regular',
  bodyMedium: 'Roboto-Medium',
  labelCaps: 'Roboto-Medium',
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
    shadowColor: '#8D99AE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)', // Glass edge
  },
  elevation2: {
    shadowColor: '#8D99AE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  elevation3: {
    shadowColor: '#8D99AE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  bottomStrokePrimary: {
    borderBottomWidth: 0, // removed hard strokes
    borderRightWidth: 0,
  },
  bottomStrokeSecondary: {},
  bottomStrokeTertiary: {},
  bottomStrokeError: {},
};

export const SIZES = {
  radiusSm: 8,
  radius: 12,
  radiusMd: 16,
  radiusLg: 24,
  radiusXl: 32,
  radiusCard: 24, // Rounded glass cards
  radiusButton: 16, // Pill-like or very round buttons
  radiusBadge: 12,
  radiusFull: 9999,
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
