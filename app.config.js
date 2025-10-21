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
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/famcal.png',
      backgroundColor: '#1a3a52',
    },
    package: 'com.groupcalendar.app',
    permissions: ['READ_CALENDAR', 'WRITE_CALENDAR'],
    useNextNotificationsApi: true,
  },
  web: {
    favicon: './assets/famcal.png',
  },
  extra: {
    eas: {
      projectId: 'your-project-id',
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
        sounds: ['./assets/notification.wav'],
        mode: 'production',
      },
    ],
  ],
};
