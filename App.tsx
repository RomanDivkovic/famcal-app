/**
 * Main App Component
 * GroupCalendar - A cross-platform app for managing groups, calendars, and todos
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Initialize notification service when app starts
    let isCleanedUp = false;

    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.info('[App] Notification service initialized');
      } catch (error) {
        console.error('[App] Failed to initialize notifications:', error);
      }
    };

    initNotifications();

    // Cleanup function
    return () => {
      if (!isCleanedUp) {
        notificationService.cleanup();
        isCleanedUp = true;
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
