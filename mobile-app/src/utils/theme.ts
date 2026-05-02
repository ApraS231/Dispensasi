import { StatusBar, Platform } from 'react-native';

export const COLORS = {
  // Skeuomorphism & Liquid Glass Theme - Blue Palette
  bgWhite: '#BDD8E9', // Lightest blue as a base bright color

  surface: 'rgba(255, 255, 255, 0.25)', // Translucent glass surface
  surfaceDim: 'rgba(255, 255, 255, 0.15)',
  surfaceContainerLowest: 'rgba(255, 255, 255, 0.8)',
  surfaceContainerLow: 'rgba(255, 255, 255, 0.6)',
  surfaceContainer: 'rgba(255, 255, 255, 0.4)',
  surfaceContainerHigh: 'rgba(255, 255, 255, 0.5)',
  surfaceContainerHighest: 'rgba(255, 255, 255, 0.7)',
  
  primaryLight: '#7BBDE8', // Bright blue
  primaryMuted: '#6EA2B3', // Muted blue
  
  primary: '#0A4174', // Deep blue
  onPrimary: '#FFFFFF',
  primaryContainer: 'rgba(10, 65, 116, 0.2)', // Glassy primary
  onPrimaryContainer: '#001D39', // Darkest blue
  
  secondary: '#49769F', // Medium blue
  onSecondary: '#FFFFFF',
  secondaryContainer: 'rgba(73, 118, 159, 0.2)',
  onSecondaryContainer: '#001D39',

  tertiary: '#4E8EA2', // Teal/Blue-green
  onTertiary: '#FFFFFF',
  tertiaryContainer: 'rgba(78, 142, 162, 0.2)',
  onTertiaryContainer: '#001D39',
  
  // Semantic Colors
  textPrimary: '#001D39', // Darkest blue for high contrast text
  textSecondary: '#0A4174', // Deep blue for secondary text
  textMuted: '#49769F',
  outlineVariant: 'rgba(255, 255, 255, 0.6)', // White highlight for glass edge
  
  // Status Colors (Kept vibrant but slightly adjusted for the blue theme)
  success: '#06D6A0',
  successBg: 'rgba(6, 214, 160, 0.15)',
  warning: '#FFD166',
  warningBg: 'rgba(255, 209, 102, 0.15)',
  error: '#EF476F',
  errorBg: 'rgba(239, 71, 111, 0.15)',
  info: '#7BBDE8',
  infoBg: 'rgba(123, 189, 232, 0.15)',
  
  // Inverse
  inverseSurface: '#001D39',
  inverseOnSurface: '#BDD8E9',
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
    shadowColor: '#001D39',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)', // Glass edge
  },
  elevation2: {
    shadowColor: '#001D39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  elevation3: {
    shadowColor: '#001D39',
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
