export default {
  name: 'GroupCalendar',
  slug: 'group-calendar',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/famcal.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/famcal.png',
    resizeMode: 'contain',
    backgroundColor: '#1a3a52',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.groupcalendar.app',
    infoPlist: {
      NSCalendarsUsageDescription: 'This app needs access to your calendar to sync events.',
      NSRemindersUsageDescription: 'This app needs access to your reminders to sync tasks.',
      ITSAppUsesNonExemptEncryption: false,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            // This will be dynamically set based on your Google OAuth Client ID
            // Format: com.googleusercontent.apps.YOUR-CLIENT-ID
            // You need to replace this with your actual reversed client ID from Google Console
            process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
              ? `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.split('-')[0]}`
              : 'com.googleusercontent.apps.placeholder',
          ],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/famcal.png',
      backgroundColor: '#1a3a52',
    },
    package: 'com.groupcalendar.app',
    permissions: ['READ_CALENDAR', 'WRITE_CALENDAR'],
  },
  web: {
    favicon: './assets/famcal.png',
  },
  extra: {
    eas: {
      projectId: 'd2b85b83-45b9-4e6a-bcc1-6736fc9d83fe',
    },
  },
  plugins: [
    [
      'expo-calendar',
      {
        calendarPermission: 'The app needs to access your calendar to sync events.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/famcal.png',
        color: '#1a3a52',
        mode: 'production',
      },
    ],
  ],
};
