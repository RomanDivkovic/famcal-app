# Lokal Development Build Guide

## Översikt

Den här guiden hjälper dig att bygga och köra en **Expo Development Build** lokalt på din Mac. Detta är helt **gratis** och kräver inte betalda developer accounts.

## Varför Development Build?

- ✅ Stöd för alla native dependencies (som `@gorhom/bottom-sheet`, Reanimated, osv)
- ✅ Snabbare utveckling än Expo Go
- ✅ Testa riktiga native features lokalt
- ❌ Ingen kostnad förrän du vill deploya till App Store/Google Play

---

## Förberedelser

### 1. Installera EAS CLI (om du inte har det)

```bash
npm install -g eas-cli
```

### 2. Logga in på Expo

```bash
eas login
```

Om du inte har ett Expo-konto, skapa ett gratis på [expo.dev](https://expo.dev).

### 3. Länka projektet till EAS (första gången)

```bash
eas build:configure
```

Detta skapar/uppdaterar `eas.json` och lägger till `projectId` i `app.config.js`.

---

## Bygga för iOS Simulator (Mac med Xcode)

### Steg 1: Installera Xcode från Mac App Store

Om du inte har Xcode installerat:

1. Öppna Mac App Store
2. Sök efter "Xcode"
3. Installera (kan ta ~1 timme, stor nedladdning)

### Steg 2: Installera Command Line Tools

```bash
xcode-select --install
```

### Steg 3: Bygg development build för iOS simulator

```bash
eas build --profile development --platform ios --local
```

**Vad händer:**

- Expo bygger en `.app`-fil lokalt på din Mac
- Den innehåller alla native dependencies
- Gratis och tar ~10-20 min första gången

### Steg 4: Installera builden i simulatorn

När bygget är klart:

```bash
# Öppna iOS simulatorn (från Xcode eller manuellt)
open -a Simulator

# Installera .app-filen (Expo visar sökvägen efter bygget)
# Exempel:
xcrun simctl install booted /path/to/build.app
```

Eller dra och släpp `.app`-filen direkt i simulatorn.

### Steg 5: Starta development server

```bash
npx expo start --dev-client
```

Öppna appen i simulatorn — den kommer automatiskt ansluta till Metro bundler.

---

## Bygga för Android Emulator

### Steg 1: Installera Android Studio

1. Ladda ner från [developer.android.com/studio](https://developer.android.com/studio)
2. Installera
3. Öppna Android Studio → More Actions → SDK Manager
4. Installera:
   - Android SDK Platform 34 (eller senaste)
   - Android SDK Build-Tools
   - Android Emulator

### Steg 2: Skapa en emulator (Virtual Device)

1. I Android Studio: More Actions → Virtual Device Manager
2. Create Device → Välj en phone (t.ex. Pixel 6)
3. Välj system image (t.ex. Android 14)
4. Finish

### Steg 3: Bygg development build för Android

```bash
eas build --profile development --platform android --local
```

**Vad händer:**

- Expo bygger en `.apk`-fil lokalt
- Tar ~15-30 min första gången
- Gratis

### Steg 4: Installera APK i emulatorn

När bygget är klart:

```bash
# Starta emulatorn från Android Studio eller:
~/Library/Android/sdk/emulator/emulator -avd <device_name>

# Installera APK (Expo visar sökvägen efter bygget)
adb install /path/to/build.apk
```

Eller dra och släpp `.apk`-filen direkt i emulatorn.

### Steg 5: Starta development server

```bash
npx expo start --dev-client
```

Öppna appen i emulatorn — den ansluter automatiskt.

---

## Snabbkommandon (efter första bygget)

### iOS:

```bash
# Bygg och installera
eas build --profile development --platform ios --local
xcrun simctl install booted ./path/to/build.app

# Starta dev server
npx expo start --dev-client
```

### Android:

```bash
# Bygg och installera
eas build --profile development --platform android --local
adb install ./path/to/build.apk

# Starta dev server
npx expo start --dev-client
```

---

## Felsökning

### "Xcode command line tools not found"

```bash
xcode-select --install
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### "Android SDK not found"

Lägg till i din `~/.zshrc` eller `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Kör `source ~/.zshrc` och försök igen.

### "Build failed on macOS"

Se till att du har:

- Minst 10 GB ledigt diskutrymme
- macOS 13+ (för iOS builds)
- Node.js 18+

### "Cannot connect to Metro bundler"

1. Se till att dev server körs: `npx expo start --dev-client`
2. Kontrollera att emulator/simulator är på samma nätverk
3. Starta om appen i simulatorn

---

## Nästa Steg Efter Development Build

### När du vill testa på riktiga enheter (fortfarande gratis):

```bash
# iOS (kräver Apple Developer account för att köra på riktig iPhone)
eas build --profile development --platform ios

# Android (fungerar på vilken Android-telefon som helst)
eas build --profile development --platform android
```

Du får en länk att ladda ner och installera på din enhet.

### När du är redo för produktion (kräver betalda accounts):

- **Apple Developer**: $99/år → kan deploya till App Store
- **Google Play Developer**: $25 engångsavgift → kan deploya till Play Store

```bash
# Production builds (när du har accounts)
eas build --profile production --platform all
```

---

## Kostnadssammanfattning

| Aktivitet                                     | Kostnad              |
| --------------------------------------------- | -------------------- |
| Lokal development build (simulator/emulator)  | **Gratis** ✅        |
| Testa på egen fysisk enhet (via EAS)          | **Gratis** ✅        |
| Expo account                                  | **Gratis** ✅        |
| EAS Build (cloud builds, max 30/månad gratis) | **Gratis** ✅        |
| Apple Developer Program (för App Store)       | $99/år ❌            |
| Google Play Developer (för Play Store)        | $25 engångsavgift ❌ |

---

## Tips

1. **Första bygget tar längst tid** (~20-30 min). Nästa gång går snabbare.
2. **Cachning**: EAS cachar dependencies, så uppdateringar går snabbt.
3. **Hot reload fungerar**: Ändra kod → Metro uppdaterar automatiskt i appen.
4. **Debugga med Flipper/React DevTools**: Samma verktyg som vanligt.

---

## Support

- Expo docs: [docs.expo.dev/development/build](https://docs.expo.dev/development/build/)
- EAS Build docs: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/)
- Discord: [discord.com/invite/expo](https://discord.com/invite/expo)
