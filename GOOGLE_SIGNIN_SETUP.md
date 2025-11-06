# Google Sign-In Setup Guide

## ✅ Now Possible with Development Build!

With your development build, Google Sign-In **WILL work** (it didn't work in Expo Go). Follow these steps:

---

## 1. Install Required Package

```bash
npm install @react-native-google-signin/google-signin
```

After installing, **rebuild the app** (since this is a native module):

```bash
eas build --profile development --platform ios --local
```

---

## 2. Configure Google OAuth in Firebase Console

### Step 1: Get OAuth Client ID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`GroupCalendar` or whatever your Firebase project is named)
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** as a sign-in provider
5. You'll see a **Web Client ID** - copy this (looks like `123456789-abcdefg.apps.googleusercontent.com`)

### Step 2: Create iOS OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **iOS** as application type
6. Enter:
   - **Name**: GroupCalendar iOS
   - **Bundle ID**: `com.groupcalendar.app` (must match your app.config.js)
7. Click **Create**
8. Copy the **iOS Client ID** (different from Web Client ID)

### Step 3: Get iOS URL Scheme

From the iOS Client ID you just created:

- If Client ID is: `123456789-abcdefg.apps.googleusercontent.com`
- The **reversed client ID** (URL scheme) is: `com.googleusercontent.apps.123456789-abcdefg`

---

## 3. Update app.config.js

Add the Google Sign-In URL scheme to your iOS config:

```javascript
export default {
  // ... existing config
  ios: {
    // ... existing iOS config
    bundleIdentifier: 'com.groupcalendar.app',
    infoPlist: {
      // ... existing infoPlist
      ITSAppUsesNonExemptEncryption: false,

      // Add Google Sign-In URL Scheme
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            'com.googleusercontent.apps.YOUR-IOS-CLIENT-ID-HERE', // Replace with your reversed client ID
          ],
        },
      ],
    },
  },
};
```

**Example:**
If your iOS Client ID is `123456789-abcdefg.apps.googleusercontent.com`, add:

```javascript
CFBundleURLSchemes: [
  'com.googleusercontent.apps.123456789-abcdefg',
],
```

---

## 4. Add Environment Variables

Add these to your `.env` file (create if it doesn't exist):

```env
# Existing Firebase config
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Add Google Sign-In credentials
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-hijklmn.apps.googleusercontent.com
```

---

## 5. Update firebaseService.ts

Replace the `signInWithGoogle()` method:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

class FirebaseService implements IDataService {
  // Add this to constructor or initialization
  private initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });
  }

  async signInWithGoogle(): Promise<User> {
    try {
      // Initialize Google Sign-In
      this.initializeGoogleSignIn();

      // Check if device supports Google Play Services (Android only, always true on iOS)
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      // Create Firebase credential with Google ID token
      const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);

      // Sign in to Firebase with the Google credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userInfo.user.name || undefined,
        photoURL: firebaseUser.photoURL || userInfo.user.photo || undefined,
        createdAt: new Date(),
      };

      // Store user data in database
      const userRef = ref(database, `users/${user.id}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // New user - create profile
        await set(userRef, this.serializeUser(user));
      }

      return user;
    } catch (error: any) {
      let message = 'Failed to sign in with Google';

      if (error.code === 'SIGN_IN_CANCELLED') {
        message = 'Sign in was cancelled';
      } else if (error.code === 'IN_PROGRESS') {
        message = 'Sign in is already in progress';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        message = 'Google Play Services is not available';
      }

      throw new DataServiceError(message, error.code, error);
    }
  }
}
```

Don't forget to add the import at the top:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential } from 'firebase/auth';
```

---

## 6. Update LoginScreen.tsx

Make sure your Login screen calls the Google Sign-In method when user taps the Google button:

```typescript
const handleGoogleSignIn = async () => {
  try {
    setLoading(true);
    setError('');
    await signInWithGoogle();
    // Navigation is handled by AuthContext
  } catch (err: any) {
    setError(err.message || 'Google sign-in failed');
  } finally {
    setLoading(false);
  }
};
```

---

## 7. Rebuild and Test

After making all changes:

```bash
# 1. Rebuild the app (Google Sign-In is a native module)
eas build --profile development --platform ios --local

# 2. Install in simulator
xcrun simctl install booted /path/to/GroupCalendar.app

# 3. Start development server
npx expo start --dev-client

# 4. Open app and test Google Sign-In button!
```

---

## 8. Android Setup (Optional)

If you want Google Sign-In on Android too:

### Get SHA-1 Certificate Fingerprint

```bash
# For debug builds
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the **SHA-1** fingerprint.

### Add to Firebase Console

1. Go to Firebase Console → Project Settings
2. Under "Your apps", select your Android app
3. Add the SHA-1 fingerprint
4. Download the new `google-services.json`
5. Place it in your project root (Expo will handle it)

### Update app.config.js for Android

```javascript
export default {
  android: {
    package: 'com.groupcalendar.app',
    googleServicesFile: './google-services.json', // Add this
  },
};
```

---

## Troubleshooting

### "Sign-in cancelled" immediately

- **Cause**: URL scheme not configured correctly
- **Fix**: Double-check reversed client ID in `app.config.js`

### "No ID token returned"

- **Cause**: Wrong client IDs in `.env`
- **Fix**: Make sure you're using the iOS Client ID, not the Web Client ID

### "Developer Error"

- **Cause**: SHA-1 fingerprint not added (Android only)
- **Fix**: Add SHA-1 to Firebase Console

### Build fails after adding package

- **Cause**: Native module needs rebuild
- **Fix**: Always rebuild after installing native modules:
  ```bash
  eas build --profile development --platform ios --local
  ```

---

## Summary Checklist

- [ ] Install `@react-native-google-signin/google-signin`
- [ ] Enable Google sign-in in Firebase Console
- [ ] Create iOS OAuth Client ID in Google Cloud Console
- [ ] Add reversed client ID to `app.config.js` → `ios.infoPlist.CFBundleURLTypes`
- [ ] Add client IDs to `.env` file
- [ ] Update `signInWithGoogle()` in `firebaseService.ts`
- [ ] Rebuild app with `eas build --profile development --platform ios --local`
- [ ] Test Google Sign-In button

---

## Cost

**FREE** ✅

- Google Sign-In is completely free
- No additional Firebase costs
- Works with Firebase free tier

---

## Next Steps

Once Google Sign-In works, you can:

1. Add "Sign in with Apple" (required for App Store)
2. Add profile photo sync from Google
3. Add auto-complete for email during sign-up
4. Show social profile info in app

Want me to implement Google Sign-In for you now? I can:

1. Install the package
2. Generate the configuration code
3. Update `firebaseService.ts` with working implementation
4. Add setup instructions for getting the OAuth credentials

Just let me know! 🚀
