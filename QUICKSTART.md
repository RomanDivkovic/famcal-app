# 🚀 Quick Start Guide

## 1. Initial Setup (5 minutes)

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and choose your backend:

**Option A: Use Firebase (Recommended for quick start)**
```env
EXPO_PUBLIC_USE_FIREBASE=true
```
Then follow the Firebase setup below.

**Option B: Use Custom .NET API**
```env
EXPO_PUBLIC_USE_FIREBASE=false
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com/api
```

## 2. Firebase Setup (10 minutes)

### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "GroupCalendar" (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In left sidebar, click **Authentication**
2. Click "Get started"
3. Click **Email/Password** tab
4. Enable both switches
5. Click "Save"

### Create Realtime Database
1. In left sidebar, click **Realtime Database**
2. Click "Create Database"
3. Choose location closest to you
4. Select "Start in **test mode**"
5. Click "Enable"

### Get Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register app with nickname "GroupCalendar Web"
6. Copy the config values to your `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 3. Run the App

### Start Development Server
```bash
npm start
```

This will open Expo DevTools in your browser.

### Run on iOS Simulator (Mac only)
```bash
npm run ios
```

Or press `i` in the terminal after `npm start`

### Run on Android Emulator
```bash
npm run android
```

Or press `a` in the terminal after `npm start`

### Run on Physical Device
1. Install **Expo Go** app from App Store or Google Play
2. Scan the QR code shown in terminal/browser
3. App will load on your device

### Run on Web Browser
```bash
npm run web
```

Or press `w` in the terminal after `npm start`

## 4. Test the App

### Create an Account
1. App will show Login screen
2. Click "Sign Up"
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Sign Up"

### Create a Group
1. Navigate to "Groups" tab
2. Click the + button (bottom right)
3. Enter group name and description
4. Click "Create"

### Add an Event
1. Navigate to "Calendar" tab
2. Click the + button
3. Enter event details
4. Save the event
5. (Optional) Sync to device calendar

### Add a Todo
1. Navigate to "Todos" tab
2. Click the + button
3. Enter todo details
4. Save the todo
5. Click checkbox to mark complete

### Test Theme Toggle
1. Navigate to "Profile" tab
2. Toggle "Dark Mode" switch
3. See the theme change throughout the app

## 5. Next Steps

### Customize Your App
- Edit colors in `src/theme/colors.ts`
- Add more screens as needed
- Implement group detail screens
- Add push notifications
- Implement event reminders

### Deploy to Production
1. Update Firebase security rules
2. Build for iOS/Android with EAS:
   ```bash
   npm install -g eas-cli
   eas build --platform ios
   eas build --platform android
   ```

### Switch to Custom Backend
1. Set `EXPO_PUBLIC_USE_FIREBASE=false` in `.env`
2. Set your API URL in `EXPO_PUBLIC_API_BASE_URL`
3. Restart the app
4. No code changes needed!

## 🆘 Troubleshooting

### "Cannot connect to Firebase"
- Check your `.env` file has correct credentials
- Verify Firebase project is created
- Check internet connection

### "App crashes on startup"
- Run `npm install` again
- Clear cache: `expo start -c`
- Check for TypeScript errors: `npx tsc --noEmit`

### "Calendar sync not working"
- Calendar features work better on physical devices
- Check permissions in device settings
- Verify Expo Calendar is installed: `npx expo install expo-calendar`

### "Theme not loading"
- Restart the development server
- Clear cache: `expo start -c`

## 📱 Recommended Testing Flow

1. ✅ Sign up with test account
2. ✅ Create a group
3. ✅ Add a calendar event
4. ✅ Sync event to device calendar
5. ✅ Create a todo
6. ✅ Toggle todo completion
7. ✅ Switch to dark mode
8. ✅ Sign out and sign back in

## 🎉 You're All Set!

Your app is now running with:
- ✅ Authentication
- ✅ Group management
- ✅ Calendar with native sync
- ✅ Todo lists
- ✅ Light/Dark themes
- ✅ Backend abstraction

**Need help?** Check the main README.md for detailed documentation.
