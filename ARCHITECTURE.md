# 📋 Project Overview & Architecture

## Architecture Summary

This app follows a **clean architecture** pattern with clear separation of concerns:

```
UI Layer (Screens/Components)
         ↓
   Context Layer (State Management)
         ↓
   Service Layer (Data Operations)
         ↓
   Backend (Firebase / Custom API)
```

## Key Design Patterns

### 1. **Service Abstraction Pattern**

- **Interface**: `IDataService` defines all data operations
- **Implementations**:
  - `firebaseService.ts` - Firebase Realtime DB
  - `apiService.ts` - REST API calls
- **Factory**: `dataService` singleton switches based on config
- **Benefit**: Switch backends without changing UI code

### 2. **Context Pattern**

- `ThemeContext` - Global theme state (light/dark)
- `AuthContext` - Authentication state and methods
- Provides clean API for components

### 3. **Component Composition**

- Atomic design: Base components → Composed components
- Reusable UI components with theme support
- Type-safe props with TypeScript

## Directory Structure Explained

### `/src/components/`

**Reusable UI Components**

- `Button.tsx` - Customizable button with variants
- `Input.tsx` - Text input with validation & icons
- `Card.tsx` - Container with elevation
- `Header.tsx` - App bar with navigation
- `GroupCard.tsx` - Display group info
- `EventCard.tsx` - Display event info
- `TodoItem.tsx` - Display & interact with todos

### `/src/screens/`

**Screen Components by Feature**

- `/Auth/` - Login, Register
- `/Home/` - Group list
- `/Calendar/` - Calendar view with events
- `/Todos/` - Todo list and management
- `/Profile/` - User settings

### `/src/contexts/`

**Global State Management**

- `ThemeContext.tsx` - Theme mode & colors
- `AuthContext.tsx` - User authentication state

### `/src/services/`

**Backend Integration**

- `IDataService.ts` - Interface definition
- `firebaseService.ts` - Firebase implementation
- `apiService.ts` - REST API implementation
- `firebaseConfig.ts` - Firebase setup
- `index.ts` - Service factory & exports

### `/src/types/`

**TypeScript Type Definitions**

- Core interfaces: User, Group, Event, Todo
- Navigation types
- Utility types

### `/src/theme/`

**Design System**

- `colors.ts` - Light & dark color palettes
- `typography.ts` - Text styles
- `spacing.ts` - Layout spacing & shadows
- `index.ts` - Combined theme exports

### `/src/hooks/`

**Custom React Hooks**

- `useData.ts` - Data fetching hooks for groups, events, todos
- Reusable logic for data operations

## Data Flow

### Authentication Flow

```
Login Screen
    → AuthContext.signIn()
        → dataService.signIn()
            → Firebase Auth / API
                → Store user in AuthContext
                    → Navigate to Main App
```

### Data Fetching Flow

```
Screen Component
    → useEffect / useData hook
        → dataService.getXXX()
            → Firebase / API
                → Parse & transform data
                    → Update component state
                        → Render UI
```

### Calendar Sync Flow

```
Calendar Screen
    → Request permission
        → User grants access
            → Select event to sync
                → expo-calendar.createEventAsync()
                    → Save to device calendar
                        → Update event metadata
                            → Show success
```

## Backend Switching

### How It Works

1. Environment variable: `EXPO_PUBLIC_USE_FIREBASE`
2. Service factory checks this variable
3. Returns appropriate implementation
4. All code uses `dataService` singleton
5. No UI code changes needed!

### Adding a New Backend

1. Create new service class implementing `IDataService`
2. Add condition to service factory in `services/index.ts`
3. Add environment variables for new backend
4. Update `.env` and switch!

## State Management Strategy

### Local State

- Component-specific state using `useState`
- Form inputs, UI toggles, temporary data

### Context State

- Theme (light/dark mode)
- Authentication (current user)
- Shared across many components

### Server State

- Groups, Events, Todos
- Fetched from backend
- Cached locally with refresh

## TypeScript Integration

### Type Safety Benefits

- Compile-time error checking
- IntelliSense & autocomplete
- Refactoring confidence
- Better documentation

### Key Interfaces

- `User` - User account data
- `Group` - Group details & members
- `Event` - Calendar event data
- `Todo` - Task item data
- `IDataService` - Backend operations contract

## Theme System

### Color Palette

```typescript
colors.light = {
  primary: '#1a3a52', // Dark Blue
  secondary: '#b8860b', // Dark Gold
  background: '#ffffff', // White
  // ... more colors
};
```

### Typography Scale

- h1 → h6: Heading styles
- body1, body2: Body text
- button: Button labels
- caption: Small text

### Spacing System

Based on 8px grid:

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Navigation Structure

```
Root Navigator
├── Auth Stack (if not authenticated)
│   ├── Login
│   └── Register
└── Main Stack (if authenticated)
    └── Bottom Tabs
        ├── Home (Groups)
        ├── Calendar
        ├── Todos
        └── Profile
```

## Performance Considerations

### Optimizations

- Lazy loading of screens
- Memoized components where beneficial
- Efficient list rendering with FlatList
- Image optimization
- Minimal re-renders with proper state management

### Best Practices

- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Avoid inline function definitions in render
- Optimize images before importing

## Security Features

### Implemented

- Environment variables for sensitive data
- Token-based authentication
- Input validation on forms
- Error handling throughout

### Recommended Additions

- Secure storage for tokens
- Certificate pinning for API calls
- Biometric authentication
- Data encryption at rest

## Testing Strategy (Recommended)

### Unit Tests

- Service layer functions
- Utility functions
- Hooks

### Integration Tests

- Screen flows
- Data fetching
- Context providers

### E2E Tests

- Critical user journeys
- Authentication flow
- Calendar sync

## Extensibility

### Easy to Add

- New screens (follow existing pattern)
- New components (use theme system)
- New data types (extend IDataService)
- New backends (implement IDataService)

### Feature Ideas

- Push notifications
- Event reminders
- File attachments
- Chat/comments
- Activity feed
- Search functionality
- Offline support
- Real-time collaboration

## Dependencies Overview

### Core Framework

- **expo** - App framework
- **react-native** - UI framework
- **typescript** - Type system

### Navigation

- **@react-navigation** - Routing & navigation

### Backend

- **firebase** - Backend as a service
- **@react-native-async-storage** - Local storage

### UI & Utils

- **expo-calendar** - Device calendar integration
- **date-fns** - Date manipulation
- **@expo/vector-icons** - Icons

## Development Workflow

1. **Start dev server**: `npm start`
2. **Make changes** in `/src`
3. **See updates** in real-time (Fast Refresh)
4. **Test** on multiple platforms
5. **Commit** with meaningful messages
6. **Build** with EAS when ready

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Configure Firebase security rules
- [ ] Test on physical devices
- [ ] Update app.config.js with proper identifiers
- [ ] Generate app icons & splash screen
- [ ] Build with EAS: `eas build`
- [ ] Test builds before release
- [ ] Submit to App Store / Play Store

## Resources & Links

- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **Firebase**: https://firebase.google.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Questions or need to extend the app?** Refer to this document for architectural guidance!
