export default {
  name: 'FamCaly',
  slug: 'famcaly',
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
    bundleIdentifier: 'com.famcaly.app',
    infoPlist: {
      NSCalendarsUsageDescription: 'This app needs access to your calendar to sync events.',
      NSRemindersUsageDescription: 'This app needs access to your reminders to sync tasks.',
      ITSAppUsesNonExemptEncryption: false,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            // Google Sign-In URL scheme - must be the reversed iOS Client ID
            'com.googleusercontent.apps.965105844075-dn4tilc89pt7hhj8ogl9cmv978589dii',
            'com.famcaly.app',
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
    package: 'com.famcaly.app',
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
