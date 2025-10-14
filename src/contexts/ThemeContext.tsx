/**
 * ThemeContext for managing light/dark mode throughout the app
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'auto') => void;
  themeMode: 'light' | 'dark' | 'auto';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [theme, setCurrentTheme] = useState<Theme>(lightTheme);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when mode or system color scheme changes
  useEffect(() => {
    const isDarkMode = themeMode === 'auto' 
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';
    
    setCurrentTheme(isDarkMode ? darkTheme : lightTheme);
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
        setThemeMode(savedMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: 'light' | 'dark' | 'auto') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = theme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const setTheme = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark: theme.isDark, 
      toggleTheme, 
      setTheme,
      themeMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
