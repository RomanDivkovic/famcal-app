# Firebase Setup för Development Build

## Nya funktioner med Development Build

Med development build får vi tillgång till:

1. **Push Notifications (FCM)** - Riktiga push notifications, inte bara local
2. **Background Sync** - Synka data även när appen är i bakgrunden
3. **Deep Linking** - Öppna specifika screens från notiser
4. **Native Performance** - Bättre prestanda för @gorhom/bottom-sheet, Reanimated, osv

---

## 1. Firebase Cloud Messaging (FCM) Setup

### iOS Setup (APNs)

#### Steg 1: Generera APNs Certificate (kräver Apple Developer Account)

```bash
# När du har Apple Developer Account ($99/år):
# 1. Gå till https://developer.apple.com/account/resources/certificates/list
# 2. Skapa ny "Apple Push Notification service SSL (Production)"
# 3. Ladda ner certifikatet
# 4. Konvertera till .p12:
openssl pkcs12 -export -out Certificates.p12 -inkey privateKey.key -in Certificates.crt
```

#### Steg 2: Ladda upp till Firebase Console

1. Gå till Firebase Console → Project Settings → Cloud Messaging
2. Under "Apple app configuration", klicka "Upload"
3. Välj din .p12-fil och ange lösenord
4. Spara

### Android Setup (inbyggt i Firebase)

Android använder FCM direkt, inget extra certifikat behövs! ✅

---

## 2. Uppdatera Firebase Realtime Database Rules

### Nya rules för FCM tokens och notifications

Kopiera och klistra in dessa rules i Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid",
        "fcmToken": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid"
        },
        "notificationSettings": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid"
        },
        "personal-events": {
          "$eventId": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "personal-todos": {
          "$todoId": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid"
          }
        }
      }
    },
    "groups": {
      ".read": "auth != null",
      "$groupId": {
        ".write": "auth != null && ((!data.exists() && newData.child('createdBy').val() === auth.uid && newData.child('members').child(auth.uid).val() === true) || (data.exists() && data.child('members').child(auth.uid).exists()))",
        "members": {
          "$memberId": {
            ".write": "auth != null && auth.uid === $memberId"
          }
        },
        "events": {
          "$eventId": {
            ".read": "root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
            ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()"
          }
        },
        "todos": {
          "$todoId": {
            ".read": "root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
            ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()"
          }
        },
        "notifications": {
          "$notificationId": {
            ".read": "root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
            ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()"
          }
        }
      }
    },
    "events": {
      "$eventId": {
        ".read": "auth != null && (data.child('createdBy').val() === auth.uid || root.child('groups').child(data.child('groupId').val()).child('members').child(auth.uid).exists())",
        ".write": "auth != null && (data.child('createdBy').val() === auth.uid || root.child('groups').child(data.child('groupId').val()).child('members').child(auth.uid).exists() || (!data.exists() && newData.child('createdBy').val() === auth.uid))"
      }
    },
    "todos": {
      "$todoId": {
        ".read": "auth != null && (data.child('createdBy').val() === auth.uid || root.child('groups').child(data.child('groupId').val()).child('members').child(auth.uid).exists())",
        ".write": "auth != null && (data.child('createdBy').val() === auth.uid || root.child('groups').child(data.child('groupId').val()).child('members').child(auth.uid).exists() || (!data.exists() && newData.child('createdBy').val() === auth.uid))"
      }
    },
    "user-groups": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        "$groupId": {
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    },
    "invitations": {
      "$invitationId": {
        ".read": "auth != null && data.child('invitedEmail').val() === auth.token.email",
        ".write": "auth != null"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$notificationId": {
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    }
  }
}
```

### Vad har ändrats?

✅ Lagt till `fcmToken` under users för push notification tokens
✅ Lagt till `notificationSettings` för användarinställningar
✅ Lagt till `notifications` under grupper för gruppnotiser
✅ Lagt till top-level `notifications` för personliga notiser

---

## 3. Firebase Cloud Functions (Optional - för push notifications)

### Installera Firebase Functions CLI

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### Skapa Cloud Function för notifications

Skapa `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Skicka notis när ny event skapas
export const sendEventNotification = functions.database
  .ref('/groups/{groupId}/events/{eventId}')
  .onCreate(async (snapshot, context) => {
    const event = snapshot.val();
    const groupId = context.params.groupId;

    // Hämta gruppmedlemmar
    const membersSnapshot = await admin.database().ref(`/groups/${groupId}/members`).once('value');

    const members = membersSnapshot.val();
    if (!members) return;

    // Hämta FCM tokens för alla medlemmar
    const tokens: string[] = [];
    for (const memberId of Object.keys(members)) {
      if (memberId === event.createdBy) continue; // Skip creator

      const tokenSnapshot = await admin.database().ref(`/users/${memberId}/fcmToken`).once('value');

      const token = tokenSnapshot.val();
      if (token) tokens.push(token);
    }

    if (tokens.length === 0) return;

    // Skapa notifikation
    const message = {
      notification: {
        title: '📅 Nytt event',
        body: `${event.title} - ${event.startDate}`,
      },
      data: {
        type: 'event',
        eventId: context.params.eventId,
        groupId: groupId,
      },
      tokens: tokens,
    };

    // Skicka
    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent notifications:', response.successCount);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  });

// Skicka notis när ny todo skapas
export const sendTodoNotification = functions.database
  .ref('/groups/{groupId}/todos/{todoId}')
  .onCreate(async (snapshot, context) => {
    const todo = snapshot.val();
    const groupId = context.params.groupId;

    // Hämta gruppmedlemmar
    const membersSnapshot = await admin.database().ref(`/groups/${groupId}/members`).once('value');

    const members = membersSnapshot.val();
    if (!members) return;

    // Hämta FCM tokens
    const tokens: string[] = [];
    for (const memberId of Object.keys(members)) {
      if (memberId === todo.createdBy) continue;

      const tokenSnapshot = await admin.database().ref(`/users/${memberId}/fcmToken`).once('value');

      const token = tokenSnapshot.val();
      if (token) tokens.push(token);
    }

    if (tokens.length === 0) return;

    // Skapa notifikation
    const message = {
      notification: {
        title: '✅ Ny uppgift',
        body: todo.title,
      },
      data: {
        type: 'todo',
        todoId: context.params.todoId,
        groupId: groupId,
      },
      tokens: tokens,
    };

    // Skicka
    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent notifications:', response.successCount);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  });
```

### Deploya Functions

```bash
firebase deploy --only functions
```

---

## 4. Uppdatera App.tsx för FCM

Lägg till FCM token-registrering när appen startar:

```typescript
// App.tsx
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ref, set } from 'firebase/database';
import { database, auth } from './src/services/firebaseConfig';

// Konfigurera hur notiser ska visas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('FCM Token:', token);

    // Spara token i Firebase
    const user = auth.currentUser;
    if (user) {
      await set(ref(database, `users/${user.uid}/fcmToken`), token);
    }
  }

  return (
    // ... rest of App
  );
}
```

---

## 5. Deep Linking Setup

### iOS Universal Links

Lägg till i `app.config.js`:

```javascript
export default {
  // ... existing config
  ios: {
    // ... existing iOS config
    associatedDomains: ['applinks:groupcalendar.app'],
  },
  scheme: 'groupcalendar',
};
```

### Android Deep Links

Lägg till i `app.config.js`:

```javascript
export default {
  // ... existing config
  android: {
    // ... existing Android config
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'groupcalendar.app',
            pathPrefix: '/event',
          },
          {
            scheme: 'https',
            host: 'groupcalendar.app',
            pathPrefix: '/group',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
};
```

### Hantera Deep Links i Navigation

```typescript
// src/navigation/AppNavigator.tsx
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const AppNavigator = () => {
  const linking = {
    prefixes: [prefix, 'groupcalendar://', 'https://groupcalendar.app'],
    config: {
      screens: {
        Main: {
          screens: {
            Home: 'home',
            Calendar: 'calendar',
            Todos: 'todos',
            Profile: 'profile',
          },
        },
        GroupDetail: 'group/:groupId',
        EventDetail: 'event/:eventId',
        CreateEvent: 'create-event',
        CreateTodo: 'create-todo',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      {/* ... rest of navigator */}
    </NavigationContainer>
  );
};
```

---

## 6. Background Sync (Optional)

### iOS Background Modes

Lägg till i `app.config.js`:

```javascript
export default {
  // ... existing config
  ios: {
    // ... existing iOS config
    infoPlist: {
      // ... existing infoPlist
      UIBackgroundModes: ['fetch', 'remote-notification'],
    },
  },
};
```

### Android Background Service

Lägg till i `app.config.js`:

```javascript
export default {
  // ... existing config
  android: {
    // ... existing Android config
    permissions: [
      'READ_CALENDAR',
      'WRITE_CALENDAR',
      'RECEIVE_BOOT_COMPLETED',
      'FOREGROUND_SERVICE',
    ],
  },
};
```

---

## 7. Testing Push Notifications

### Test med Expo Push Notification Tool

```bash
# Hämta din Expo push token från appen
# Gå till https://expo.dev/notifications
# Klistra in token och skicka test-notis
```

### Test med Firebase Console

1. Gå till Firebase Console → Cloud Messaging
2. Klicka "Send your first message"
3. Skriv titel och body
4. Under "Target", välj "User segment" → "All users"
5. Klicka "Send"

### Test med cURL

```bash
curl -X POST "https://fcm.googleapis.com/fcm/send" \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "EXPO_PUSH_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test"
    },
    "data": {
      "type": "test"
    }
  }'
```

---

## 8. Kostnader

| Feature                    | Free Tier                             | Kostnad efter free tier             |
| -------------------------- | ------------------------------------- | ----------------------------------- |
| Firebase Realtime Database | 1 GB lagring, 10 GB/månad nedladdning | $5/GB lagring, $1/GB nedladdning    |
| Firebase Cloud Messaging   | Obegränsat                            | **Gratis** ✅                       |
| Firebase Cloud Functions   | 2M anrop/månad, 400k GB-sekunder      | $0.40/M anrop, $0.0000025/GB-sekund |
| Firebase Authentication    | Obegränsat                            | **Gratis** ✅                       |

**För er app:**

- FCM: Gratis
- Realtime Database: Sannolikt gratis (om < 10 GB/månad)
- Cloud Functions: ~$0-5/månad (beroende på användning)

---

## Nästa Steg

1. ✅ **Development build klar** - Vänta på bygget
2. ⏳ **Testa appen** - Installera och kör
3. 🔄 **Uppdatera Firebase Rules** - Kopiera nya rules
4. 🔔 **Lägg till FCM token-registrering** - Uppdatera App.tsx
5. 📱 **Testa push notifications** - Skicka test-notis
6. 🚀 **Deploya Cloud Functions** (optional) - För automatiska notiser
7. 🔗 **Setup deep linking** - För att öppna specifika screens

Vill du att jag implementerar något av dessa direkt i koden nu?
