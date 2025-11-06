# Quick Start Guide - New Features

## 🚀 What's New

1. **Google Sign-In** - Sign in with your Google account
2. **Calendar Import** - Import all your existing device calendar events
3. **Real-Time Updates** - Events appear instantly (no more logout/login!)

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Create **TWO** client IDs:
   - **Web Application** (for both iOS & Android)
   - **iOS Application** (enter bundle ID: `com.groupcalendar.app`)

### Step 2: Create .env File

Create a file named `.env` in the project root:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=987654321.apps.googleusercontent.com
```

Replace with your actual client IDs from Step 1.

### Step 3: Rebuild App

```bash
eas build --profile development --platform ios --local
```

**Important:** You MUST rebuild because Google Sign-In is a native module!

### Step 4: Install & Test

After build completes:

```bash
# The build will create a .app file - install it in the simulator
npx expo start --dev-client
```

---

## 🎯 How to Use

### Google Sign-In

1. Open app
2. Tap "Sign in with Google" on login screen
3. Choose your Google account
4. Grant permissions
5. Done! ✅

### Import Calendar Events

1. Go to Calendar tab
2. Tap "Enable Calendar Sync" (first time)
3. Grant calendar permission
4. Tap "Import Events" when prompted
5. Wait for import to complete
6. All your device calendar events are now in the app! 🎉

**To import again later:**

- Just tap "Import Device Calendar Events" button

### Real-Time Updates

No setup needed! Just works automatically:

- Create an event → appears instantly (within 5 seconds)
- Other group members see it too
- No more logout/login! 🚀

---

## 🐛 Troubleshooting

### Google Sign-In Not Working

**Problem:** "No ID token received"

- **Fix:** Make sure you created BOTH Web and iOS client IDs
- **Fix:** Check that `.env` file has correct client IDs
- **Fix:** Rebuild app after changing `.env`

**Problem:** "SIGN_IN_CANCELLED"

- **Fix:** User cancelled the sign-in flow - just try again

**Problem:** "Google sign-in is not available"

- **Fix:** You're running Expo Go - need development build!

### Calendar Import Issues

**Problem:** "Calendar permission required"

- **Fix:** Go to Settings → Privacy → Calendars → Enable for app

**Problem:** "Import Failed"

- **Fix:** Check you have calendar events on your device
- **Fix:** Make sure calendar permission is granted

**Problem:** Events not appearing after import

- **Fix:** Wait 5 seconds for automatic refresh
- **Fix:** Pull down to manually refresh

### Events Not Updating

**Problem:** New events don't appear

- **Fix:** Wait up to 5 seconds for automatic refresh
- **Fix:** Pull down on calendar to force refresh
- **Fix:** Check Firebase connection (red error banner?)

---

## 📖 Detailed Documentation

- **Google OAuth Setup:** See `GOOGLE_SIGNIN_SETUP.md`
- **Development Build:** See `LOCAL_DEV_BUILD_GUIDE.md`
- **Firebase Setup:** See `FIREBASE_DEV_BUILD_SETUP.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Testing Checklist

After rebuild, test these:

- [ ] Google Sign-In works
- [ ] Calendar permission prompt appears
- [ ] Import device calendar events works
- [ ] Imported events show in calendar
- [ ] Create new event → appears within 5 seconds
- [ ] Event syncs to device calendar (if permission granted)
- [ ] Pull-to-refresh still works
- [ ] Other group members see new events (test with second account)

---

## 🔥 Pro Tips

1. **Import Once:** Only import device calendar events once to avoid duplicates
2. **Real-Time Magic:** Events now appear instantly - no need to refresh manually!
3. **Google Sign-In:** Faster than email/password - just one tap!
4. **Calendar Sync:** Events automatically go to your device calendar when created

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Read the detailed docs (`GOOGLE_SIGNIN_SETUP.md`, etc.)
3. Check console logs for error messages
4. Make sure you rebuilt the app after installing Google Sign-In

**Common mistake:** Forgetting to rebuild after adding `.env` file! 🤦

---

## 🎊 Enjoy Your New Features!

You now have:

- ⚡ Instant Google Sign-In
- 📅 Full calendar import
- 🔄 Real-time event updates

No more logout/login to see events! 🎉
