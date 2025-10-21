# 📱 EAS Build Configuration Explained

## What is `eas.json`?

This file tells Expo Application Services (EAS) how to build your app for different environments and platforms.

---

## 🏗️ Build Profiles Explained

### 1. **Development Profile**

```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": true
  }
}
```

**What it does:**

- Builds a "development client" (like Expo Go, but with your custom native code)
- Can run on iOS **simulator** ✅
- Can run on physical devices via internal distribution
- Good for: Testing native features (like notifications) during development

**Use case:**

- You're adding native modules (like expo-notifications)
- You need to test on simulator
- You want development experience with custom native code

**Build command:**

```bash
eas build --profile development --platform ios
```

**Can I use simulator?** ✅ YES - This profile specifically enables simulator builds!

---

### 2. **Preview Profile**

```json
"preview": {
  "distribution": "internal",
  "ios": {
    "simulator": false
  },
  "android": {
    "buildType": "apk"
  }
}
```

**What it does:**

- iOS: Builds for **physical devices only** (not simulator) ❌
- Android: Builds APK file (easy to install directly)
- Internal distribution (not App Store/Play Store)
- Good for: Testing on real devices before production

**Use case:**

- Share build with testers
- Test on physical iOS devices
- Test on physical Android devices
- Not ready for App Store/Play Store yet

**Build commands:**

```bash
# iOS - installs on device via TestFlight or direct install
eas build --profile preview --platform ios

# Android - creates APK you can install directly
eas build --profile preview --platform android
```

**Can I use simulator?** ❌ NO - This profile is for physical devices only

**Why disable simulator for preview?**

- Simulator builds are larger
- Some features don't work on simulator (notifications, camera, etc.)
- Real devices are better for testing production-like experience

---

### 3. **Production Profile**

```json
"production": {
  "ios": {
    "buildType": "release"
  },
  "android": {
    "buildType": "app-bundle"
  }
}
```

**What it does:**

- iOS: Creates optimized **release build** for App Store
- Android: Creates **App Bundle** (AAB) for Play Store
- Fully optimized and minified
- Good for: Final production deployment

**Use case:**

- Submitting to App Store
- Submitting to Play Store
- Public release

**Build commands:**

```bash
# iOS - creates IPA for App Store
eas build --profile production --platform ios

# Android - creates AAB for Play Store
eas build --profile production --platform android
```

**Can I use simulator?** ❌ NO - Production builds are for App Store/Play Store distribution only

---

## 🎯 When to Use Each Profile

| Scenario                        | Profile       | Simulator Support |
| ------------------------------- | ------------- | ----------------- |
| Testing native features locally | `development` | ✅ YES            |
| Early testing on real devices   | `preview`     | ❌ NO             |
| Sharing with beta testers       | `preview`     | ❌ NO             |
| App Store submission            | `production`  | ❌ NO             |
| Play Store submission           | `production`  | ❌ NO             |

---

## 📤 Submit Configuration

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@email.com",
      "ascAppId": "your-app-store-connect-id",
      "appleTeamId": "your-team-id"
    },
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "internal"
    }
  }
}
```

**What it does:**

- Automatically submits build to App Store Connect (iOS) or Play Console (Android)
- No need to manually upload builds
- Saves time!

**How to use:**

1. Fill in your Apple/Google credentials
2. Run build command
3. Run submit command:

```bash
# After iOS build completes
eas submit --platform ios --latest

# After Android build completes
eas submit --platform android --latest
```

---

## 🔧 Your Question: "We can't make builds on simulators?"

**Answer:** It depends on the profile!

### ✅ YES - You CAN build for simulator:

```bash
# Use development profile
eas build --profile development --platform ios

# This WILL work on simulator!
```

### ❌ NO - These DON'T work on simulator:

```bash
# Preview profile - physical devices only
eas build --profile preview --platform ios

# Production profile - App Store only
eas build --profile production --platform ios
```

---

## 💡 Recommended Workflow

### During Development:

```bash
# Use Expo Go (FREE, fastest)
npm start

# Or build development client for simulator (when you need native features)
eas build --profile development --platform ios
```

### Before Production:

```bash
# Build preview for real device testing
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### For Production:

```bash
# Build for App Store/Play Store
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## 🎓 Why These Profiles?

### Development vs Simulator:

- **Expo Go**: Works on simulator, limited to JS features ✅
- **Development build**: Works on simulator, includes native code ✅
- **Preview/Production**: Real devices only, optimized for distribution ❌

### APK vs App Bundle (Android):

- **APK** (preview): Easy to install, larger file size
- **App Bundle** (production): Optimized by Play Store, smaller downloads

### Release Build (iOS):

- Development builds include debugging tools (slower, larger)
- Release builds are optimized (faster, smaller, App Store ready)

---

## 🚀 Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for simulator (development)
eas build --profile development --platform ios

# Build for physical device testing (preview)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Build for production (App Store/Play Store)
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest

# Check build status
eas build:list
```

---

## 💰 EAS Build Pricing

### Free Tier:

- ✅ **30 builds/month** (any profile, any platform)
- ✅ Enough for most development
- ✅ Unlimited builds during active development with Expo Go

### Paid Tier (if you need more):

- Priority builds (faster queue)
- More builds per month
- But honestly, 30 free builds is plenty!

---

## ✅ Summary

1. **Development profile** = Simulator ✅ + Native features
2. **Preview profile** = Physical devices only, testing
3. **Production profile** = App Store/Play Store ready
4. **You CAN build for simulator** with development profile!
5. **Use Expo Go** for most development (fastest, free)
6. **Use EAS builds** when you need native features or production builds

---

## 🆘 Need Help?

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Build Profiles**: https://docs.expo.dev/build-reference/eas-json/
- **Simulators**: https://docs.expo.dev/build-reference/simulators/
- **Submit Guide**: https://docs.expo.dev/submit/introduction/

---

**Your `eas.json` is properly configured and ready to use!** 🎉
