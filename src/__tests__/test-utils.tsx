/**
 * Test Utilities
 * Helper functions and wrappers for testing components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { lightTheme } from '../theme';

// Mock theme context value
const mockThemeContext = {
  theme: lightTheme,
  isDark: false,
  toggleTheme: jest.fn(),
};

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Export mock theme for tests that need it
export { mockThemeContext };
