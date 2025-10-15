# 📱 GroupCalendar - Cross-Platform Group Management App

A comprehensive React Native (Expo) application for managing groups, shared calendars, and collaborative to-do lists with seamless backend switching between Firebase and custom .NET API.

## ✨ Features

### 🔐 Authentication

- Email/password authentication
- Google Sign-In support (requires additional setup)
- Secure session management
- Backend-agnostic auth abstraction

### 👥 Group Management

- Create and manage multiple groups
- Invite members via email or invite codes
- Join/leave groups
- Color-coded group identification
- Real-time member updates

### 📅 Calendar System

- Personal calendar for individual events
- Shared group calendars
- Combined view of all events (color-coded by group)
- **Native calendar sync** via Expo Calendar API
- Sync events to iOS/Android device calendar
- Event reminders and notifications
- Date range filtering

### ✅ To-Do Lists

- Create personal and group todos
- Assign tasks to group members
- Set due dates and priorities
- Link todos to calendar events
- Mark tasks as complete
- Filter by status (all/active/completed)

### 🎨 Design System

- **Light Mode Colors**: Dark Blue (#1a3a52), Dark Gold (#b8860b), White
- **Dark Mode**: Automatically adjusted colors for better contrast
- Custom reusable components (Button, Card, Input, etc.)
- Responsive layouts
- Consistent spacing and typography
- Icon support via Expo vector icons

### 🔄 Backend Abstraction

- **Easy switching** between Firebase and custom .NET API
- Single interface (`IDataService`) for all data operations
- No UI refactoring needed when changing backends
- Environment variable configuration

## 🏗️ Project Structure

```
GroupCalendarApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Header.tsx
│   │   ├── GroupCard.tsx
│   │   ├── EventCard.tsx
│   │   └── TodoItem.tsx
│   ├── screens/            # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Home/
│   │   │   └── HomeScreen.tsx
│   │   ├── Calendar/
│   │   │   └── CalendarScreen.tsx
│   │   ├── Todos/
│   │   │   └── TodosScreen.tsx
│   │   └── Profile/
│   │       └── ProfileScreen.tsx
│   ├── contexts/           # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Backend services
│   │   ├── IDataService.ts        # Service interface
│   │   ├── firebaseService.ts     # Firebase implementation
│   │   ├── apiService.ts          # REST API implementation
│   │   ├── firebaseConfig.ts      # Firebase configuration
│   │   └── index.ts               # Service factory
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── theme/             # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── navigation/        # Navigation setup
│       └── AppNavigator.tsx
├── App.tsx                # Main app entry point
├── app.config.js         # Expo configuration
├── .env                  # Environment variables (local)
├── .env.example          # Environment variables template
└── package.json          # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for Android)

### Installation

1. **Clone or navigate to the project**

   ```bash
   cd GroupCalendarApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update with your configuration:

   ```env
   EXPO_PUBLIC_USE_FIREBASE=true  # or false for custom API

   # Firebase Configuration (if using Firebase)
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Custom API Configuration (if using .NET backend)
   EXPO_PUBLIC_API_BASE_URL=https://your-api.com/api
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   Or use specific platforms:

   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web browser
   ```

## 🔥 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Authentication and Realtime Database

### 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable **Google** sign-in

### 3. Set Up Realtime Database

1. Go to **Realtime Database**
2. Click "Create Database"
3. Choose a location
4. Start in **test mode** (update security rules later)

### 4. Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Scroll to "Your apps" section
3. Click the web icon (</>) to register a web app
4. Copy the configuration values to your `.env` file

### 5. Security Rules (Production)

Update your Firebase Realtime Database rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "groups": {
      "$groupId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "events": {
      "$eventId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "todos": {
      "$todoId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## 🔄 Switching Between Firebase and Custom Backend

The app is designed to easily switch between Firebase and a custom .NET backend.

### Using Firebase

Set in `.env`:

```env
EXPO_PUBLIC_USE_FIREBASE=true
```

### Using Custom .NET API

1. Set in `.env`:

   ```env
   EXPO_PUBLIC_USE_FIREBASE=false
   EXPO_PUBLIC_API_BASE_URL=https://your-api.com/api
   ```

2. Your .NET API should implement these endpoints:

   **Authentication**
   - `POST /auth/signup` - Register new user
   - `POST /auth/signin` - Login user
   - `POST /auth/signout` - Logout user
   - `GET /auth/me` - Get current user

   **Groups**
   - `GET /users/:userId/groups` - Get user's groups
   - `GET /groups/:groupId` - Get group details
   - `POST /groups` - Create group
   - `PATCH /groups/:groupId` - Update group
   - `DELETE /groups/:groupId` - Delete group
   - `POST /groups/:groupId/join` - Join group
   - `POST /groups/:groupId/leave` - Leave group

   **Events**
   - `GET /users/:userId/events` - Get user's events
   - `GET /events/:eventId` - Get event details
   - `POST /events` - Create event
   - `PATCH /events/:eventId` - Update event
   - `DELETE /events/:eventId` - Delete event

   **Todos**
   - `GET /users/:userId/todos` - Get user's todos
   - `GET /todos/:todoId` - Get todo details
   - `POST /todos` - Create todo
   - `PATCH /todos/:todoId` - Update todo
   - `DELETE /todos/:todoId` - Delete todo
   - `POST /todos/:todoId/toggle` - Toggle completion

All requests should accept `Authorization: Bearer <token>` header.

## 📱 Native Calendar Integration

The app integrates with iOS/Android device calendars using Expo Calendar API.

### Permissions

Calendar permissions are automatically requested when needed. The app will:

1. Ask for permission when trying to sync an event
2. Show a permission prompt on the Calendar screen
3. Store sync status for each event

### Syncing Events

1. Navigate to the Calendar screen
2. Tap on an event
3. Choose "Sync" when prompted
4. The event will be added to your device's default calendar

## 🎨 Theming

### Light Mode

- Primary: Dark Blue (#1a3a52)
- Secondary: Dark Gold (#b8860b)
- Background: White (#ffffff)

### Dark Mode

- Primary: Lighter Blue (#4a7ba7)
- Secondary: Gold (#daa520)
- Background: Dark (#121212)

Toggle theme in Profile screen or it will auto-detect system preference.

## 📦 Dependencies

### Core

- `expo` - Expo SDK
- `react-native` - React Native framework
- `typescript` - Type safety

### Navigation

- `@react-navigation/native` - Navigation library
- `@react-navigation/native-stack` - Stack navigator
- `@react-navigation/bottom-tabs` - Tab navigator
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen components

### Backend

- `firebase` - Firebase SDK
- `@react-native-async-storage/async-storage` - Local storage

### UI & Utilities

- `expo-calendar` - Calendar integration
- `date-fns` - Date manipulation
- `@expo/vector-icons` - Icon library

## 🛠️ Development

### Running on iOS

```bash
npm run ios
```

### Running on Android

```bash
npm run android
```

### Running on Web

```bash
npm run web
```

### Type Checking

```bash
npx tsc --noEmit
```

## 📝 Environment Variables

| Variable                                   | Description                               | Required            |
| ------------------------------------------ | ----------------------------------------- | ------------------- |
| `EXPO_PUBLIC_USE_FIREBASE`                 | Use Firebase (true) or custom API (false) | Yes                 |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Firebase API key                          | If using Firebase   |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                      | If using Firebase   |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL`        | Firebase database URL                     | If using Firebase   |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID                       | If using Firebase   |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                   | If using Firebase   |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID              | If using Firebase   |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID                           | If using Firebase   |
| `EXPO_PUBLIC_API_BASE_URL`                 | Custom API base URL                       | If using custom API |

## 🚢 Deployment

### Building for iOS

```bash
eas build --platform ios
```

### Building for Android

```bash
eas build --platform android
```

### Publishing Updates

```bash
eas update
```

For more information, see [Expo EAS Documentation](https://docs.expo.dev/eas/).

## 🔐 Security Considerations

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Update Firebase security rules** before production
3. **Use HTTPS** for custom API endpoints
4. **Implement proper authentication** tokens with expiration
5. **Validate all inputs** on the backend
6. **Use environment-specific configs** for dev/staging/prod

## 🐛 Troubleshooting

### Firebase Authentication Issues

- Verify Firebase credentials in `.env`
- Check Firebase Console for enabled auth methods
- Ensure app is registered in Firebase project

### Calendar Sync Not Working

- Check calendar permissions in device settings
- Verify Expo Calendar plugin in `app.config.js`
- Test on physical device (some features don't work in simulator)

### Backend Connection Issues

- Verify `EXPO_PUBLIC_API_BASE_URL` is correct
- Check network connectivity
- Verify API is running and accessible
- Check CORS settings on your API

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation Documentation](https://reactnavigation.org/)

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using Expo, React Native, and TypeScript**

# famcal-app
