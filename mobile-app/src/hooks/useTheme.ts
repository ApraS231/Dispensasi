import { useThemeStore } from '../stores/themeStore';
import { getColors, getShadows, SPACING, SIZES, FONTS, TYPOGRAPHY, GLASS } from '../utils/theme';

export function useTheme() {
  const { resolvedMode, mode, setMode } = useThemeStore();
  
  const colors = getColors(resolvedMode);
  const shadows = getShadows(resolvedMode);
  const isDark = resolvedMode === 'dark';
  
  return {
    colors,
    shadows,
    isDark,
    mode,
    setMode,
    SPACING,
    SIZES,
    FONTS,
    TYPOGRAPHY,
    GLASS,
  };
}
export type Theme = ReturnType<typeof useTheme>;
export type ThemeColors = ReturnType<typeof useTheme>['colors'];
