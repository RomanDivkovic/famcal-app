# Firebase Setup Guide

## Current Configuration

Your Firebase project is configured and the credentials are in your `.env` file.

## Required Firebase Services

To make the app work properly, you need to enable these services in your Firebase Console:

### 1. **Firebase Authentication** (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **app-famcal-expo**
3. Click on **Authentication** in the left menu
4. Click **Get Started**
5. Enable **Email/Password** sign-in method:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### 2. **Firebase Realtime Database** (Required)

1. In Firebase Console, click on **Realtime Database**
2. Click **Create Database**
3. Choose a location (e.g., **us-central1** or closest to you)
4. Start in **Test Mode** for development (you can change rules later)
5. Update your `.env` file with the correct database URL if it's different

**Test Mode Rules** (for development):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 3. **Storage Rules** (Optional, for future features)

If you plan to use Firebase Storage for images:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Common Issues

### "Failed to sign up" Error

**Possible causes:**

1. **Email/Password authentication not enabled** in Firebase Console
2. **Realtime Database not created** or rules are too restrictive
3. **Invalid Firebase credentials** in `.env` file
4. **Network connectivity** issues

**To fix:**

1. Check that Authentication is enabled (see step 1 above)
2. Check that Realtime Database exists and has proper rules
3. Verify your `.env` file has the correct Firebase credentials
4. Make sure your device/simulator has internet access

### Google Sign-in Not Working

Google Sign-in **does not work with Expo Go**. It requires:

- A custom development build (requires Apple Developer account)
- Or use Email/Password authentication instead

For now, the Google Sign-in button is disabled in the app.

## Security Notes

⚠️ **Never commit your `.env` file to GitHub!**

Your `.env` file contains sensitive Firebase credentials. Make sure:

- `.env` is in your `.gitignore` file
- Use `.env.example` for sharing structure without credentials
- For production, use environment-specific configurations

## Testing Your Setup

1. **Start the app**: `npx expo start`
2. **Try to register**: Use a valid email and password (min 6 characters)
3. **Check Firebase Console**:
   - Go to Authentication → Users to see if user was created
   - Go to Realtime Database → Data to see if user data was stored

## Database Structure

Your app creates this structure in Firebase Realtime Database:

```
root/
├── users/
│   └── {userId}/
│       ├── id
│       ├── email
│       ├── displayName
│       └── createdAt
├── groups/
│   └── {groupId}/
│       ├── name
│       ├── description
│       ├── members: []
│       └── createdAt
├── events/
│   └── {eventId}/
│       ├── title
│       ├── startDate
│       └── ...
└── todos/
    └── {todoId}/
        ├── text
        ├── completed
        └── ...
```

## Next Steps

1. ✅ Enable Authentication in Firebase Console
2. ✅ Create Realtime Database in Firebase Console
3. ✅ Test registration with email/password
4. ✅ Create your first group
5. ✅ Add events and todos

## Support

If you continue to have issues:

1. Check the console logs in Expo
2. Check Firebase Console for error messages
3. Verify all Firebase services are enabled
4. Make sure Firebase rules allow authenticated access
