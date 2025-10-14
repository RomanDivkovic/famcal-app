/**
 * Main theme export combining all theme elements
 */

import { colors, ColorPalette } from './colors';
import { typography, Typography } from './typography';
import { spacing, borderRadius, shadows, Spacing } from './spacing';

export interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: colors.light,
  typography,
  spacing,
  borderRadius,
  shadows,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: colors.dark,
  typography,
  spacing,
  borderRadius,
  shadows,
  isDark: true,
};

export { colors, typography, spacing, borderRadius, shadows };
export type { ColorPalette, Typography, Spacing };
