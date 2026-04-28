import { StatusBar, Platform } from 'react-native';

export const COLORS = {
  // 60% Dominan (Latar Belakang / Ruang Kosong)
  bgWhite: '#FFFFFF',
  surface: '#FAFFF5', // M3 light surface (hint of green)
  surfaceDim: '#E8F5E9',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F1F8E9',
  surfaceContainer: '#DCEDC8',
  surfaceContainerHigh: '#C8E6C9',
  surfaceContainerHighest: '#A5D6A7',
  
  // 30% Sekunder (Struktur & Latar Belakang Komponen)
  primaryLight: '#E8F5E9',
  primaryMuted: '#A5D6A7',
  
  // 10% Aksen (Focal Point & Aksi Utama)
  primary: '#2E7D32', // M3 Green 800 (Contrast for white text)
  onPrimary: '#FFFFFF',
  primaryContainer: '#53F726', // User's vibrant green
  onPrimaryContainer: '#1B5E20', // Dark green text
  
  secondary: '#9CCC65', // Lime
  onSecondary: '#000000',
  secondaryContainer: '#BCF726', // User's lime green
  onSecondaryContainer: '#33691E',
  
  tertiary: '#F9A825', // Amber
  onTertiary: '#000000',
  tertiaryContainer: '#F7CA26', // User's gold
  onTertiaryContainer: '#F57F17',
  
  // Semantic Colors
  textPrimary: '#1A2118',     
  textSecondary: '#4A554A',   
  textMuted: '#A0AEC0',       
  outlineVariant: '#C2C9BD',
  
  // Status Colors
  success: '#38A169',
  successBg: '#E8F5E9',
  warning: '#D69E2E',
  warningBg: '#FFFDE7',
  error: '#E53E3E',
  errorBg: '#FFF5F5',
  info: '#3182CE',
  infoBg: '#EBF8FF',
  
  // Inverse
  inverseSurface: '#2F312E',
  inverseOnSurface: '#F1F1F1',
};

export const FONTS = {
  heading: 'Roboto-Bold',
  headingSemi: 'Roboto-Medium',
  body: 'Roboto-Regular',
  bodyMedium: 'Roboto-Medium', 
  labelCaps: 'Roboto-Bold', 
  code: 'Roboto-Regular', 
};

// Typography presets
export const TYPOGRAPHY = {
  h1: { fontFamily: FONTS.heading, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: FONTS.headingSemi, fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: FONTS.headingSemi, fontSize: 20, lineHeight: 28 },
  bodyLg: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 20 },
  labelCaps: { fontFamily: FONTS.labelCaps, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' as const },
};

export const SHADOWS = {
  softCard: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1, // M3 level 1
  },
  elevation2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3, // M3 level 2
  },
  elevation3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6, // M3 level 3
  },
  bottomStrokePrimary: {},
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
  radiusCard: 12, // M3 standard card radius
  radiusButton: 9999, // M3 full pill for primary action
  radiusBadge: 9999,
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
