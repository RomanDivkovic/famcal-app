/**
 * Firebase Configuration
 * Configure your Firebase project here
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
// @ts-ignore - AsyncStorage for React Native persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// These values are loaded from your .env file via EXPO_PUBLIC_* variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'YOUR_DATABASE_URL',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.error('⚠️ Firebase not configured! Please check your .env file');
} else {
  console.log('✅ Firebase configured for project:', firebaseConfig.projectId);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence for React Native
// This prevents the "Auth state will default to memory persistence" warning
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: AsyncStorage as any,
  });
} catch (error: any) {
  // If auth is already initialized, just get it
  if (error.code === 'auth/already-initialized') {
    authInstance = getAuth(app);
  } else {
    throw error;
  }
}

export const auth = authInstance;

// Initialize Firebase Database
export const database = getDatabase(app);

export default app;
