/**
 * Color palette for the app
 * Light mode: dark blue, dark gold, white
 * Dark mode: adjusted colors for better contrast
 */

export const colors = {
  light: {
    primary: '#1a3a52', // Dark blue
    secondary: '#b8860b', // Dark gold
    background: '#ffffff', // White
    surface: '#f5f5f5', // Light gray for cards
    text: '#1a1a1a', // Almost black
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#d32f2f',
    success: '#388e3c',
    warning: '#f57c00',
    info: '#0288d1',
    disabled: '#bdbdbd',
    placeholder: '#9e9e9e',
    
    // Semantic colors
    cardBackground: '#ffffff',
    headerBackground: '#1a3a52',
    headerText: '#ffffff',
    tabBarBackground: '#ffffff',
    tabBarActive: '#1a3a52',
    tabBarInactive: '#9e9e9e',
    
    // Group/Event colors (for visual differentiation)
    groupColors: [
      '#1a3a52', // Dark blue
      '#b8860b', // Dark gold
      '#2e7d32', // Green
      '#c62828', // Red
      '#6a1b9a', // Purple
      '#00838f', // Teal
      '#e65100', // Deep orange
    ],
  },
  dark: {
    primary: '#4a7ba7', // Lighter blue for dark mode
    secondary: '#daa520', // Gold
    background: '#121212', // Dark background
    surface: '#1e1e1e', // Slightly lighter than background
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#333333',
    error: '#ef5350',
    success: '#66bb6a',
    warning: '#ffa726',
    info: '#29b6f6',
    disabled: '#666666',
    placeholder: '#757575',
    
    // Semantic colors
    cardBackground: '#1e1e1e',
    headerBackground: '#1a1a1a',
    headerText: '#ffffff',
    tabBarBackground: '#1e1e1e',
    tabBarActive: '#4a7ba7',
    tabBarInactive: '#757575',
    
    // Group/Event colors (adjusted for dark mode)
    groupColors: [
      '#4a7ba7', // Lighter blue
      '#daa520', // Gold
      '#66bb6a', // Light green
      '#ef5350', // Light red
      '#ba68c8', // Light purple
      '#26c6da', // Light teal
      '#ff9800', // Orange
    ],
  },
};

export type ColorPalette = typeof colors.light;
