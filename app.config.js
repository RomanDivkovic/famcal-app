export default {
  name: 'GroupCalendar',
  slug: 'group-calendar',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1a3a52'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.groupcalendar.app',
    infoPlist: {
      NSCalendarsUsageDescription: 'This app needs access to your calendar to sync events.',
      NSRemindersUsageDescription: 'This app needs access to your reminders to sync tasks.'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a3a52'
    },
    package: 'com.groupcalendar.app',
    permissions: [
      'READ_CALENDAR',
      'WRITE_CALENDAR'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  },
  plugins: [
    [
      'expo-calendar',
      {
        calendarPermission: 'The app needs to access your calendar to sync events.'
      }
    ]
  ]
};
