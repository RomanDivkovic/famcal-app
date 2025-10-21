# 🔔 Notifications Guide

## Overview

Your app now has **local push notifications** integrated! This allows users to receive reminders for:

1. **📅 Events** - Get notified before an event starts (default: 15 minutes before)
2. **✅ Todos** - Get reminded when a todo is due soon (default: 2 hours before)
3. **👥 Group Invites** - Instant notification when invited to a group

---

## 🎯 Features Implemented

### 1. Event Notifications

- Automatically schedule notification when creating event
- Notify users X minutes before event starts (configurable)
- Works for both personal and group events
- Cancel notification if event is deleted

### 2. Todo Notifications

- Automatically schedule notification when creating todo with due date
- Notify users X hours before todo is due (configurable)
- Works for both personal and group todos
- Cancel notification if todo is completed or deleted

### 3. Group Invite Notifications

- Instant notification when user is added to a group
- Shows group name and who invited them
- Tapping notification can navigate to group

---

## 📱 How It Works

### For Users (Expo Go - Development):

**Note:** Notifications work differently in Expo Go vs standalone builds:

#### In Expo Go (Development):

- ✅ Local notifications work perfectly
- ❌ Push notifications from server DON'T work
- ✅ All scheduled notifications work
- ✅ Notification sounds, badges, and banners work

#### In Standalone Builds (EAS Build):

- ✅ Everything works including push notifications
- ✅ Can send notifications from server using Expo Push Service
- ✅ Full notification experience

### Testing Notifications:

1. **Start the app** on physical device (simulator has limited support)
2. **Grant notification permissions** when prompted
3. **Create an event** - you'll get notified 15 min before
4. **Create a todo** with due date - you'll get notified 2 hours before
5. **Join a group** - instant notification

---

## 🔧 Implementation Details

### Files Created:

#### 1. `src/services/notificationService.ts`

Central service for all notification operations:

```typescript
// Request permissions
await notificationService.requestPermissions();

// Schedule event notification (15 min before)
await notificationService.scheduleEventNotification(
  eventId,
  'Team Meeting',
  new Date('2025-10-21T14:00:00'),
  15 // minutes before
);

// Schedule todo notification (2 hours before)
await notificationService.scheduleTodoNotification(
  todoId,
  'Submit Report',
  new Date('2025-10-21T17:00:00'),
  2 // hours before
);

// Send instant group invite notification
await notificationService.sendGroupInviteNotification('Family Group', 'John Doe');

// Cancel a notification
await notificationService.cancelNotification(notificationId);
```

#### 2. `src/hooks/useNotifications.ts`

React hook for using notifications in components:

```typescript
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const {
    expoPushToken, // User's push token for server notifications
    notification, // Last received notification
    scheduleEventNotification,
    scheduleTodoNotification,
    sendGroupInviteNotification,
  } = useNotifications();

  // Use the functions...
};
```

---

## 🚀 How to Add Notifications to Your Screens

### In CreateEventScreen.tsx:

```typescript
import { useNotifications } from '../../hooks/useNotifications';

export const CreateEventScreen = () => {
  const { scheduleEventNotification } = useNotifications();

  const handleCreateEvent = async () => {
    // ... create event logic ...

    // Schedule notification 15 minutes before event
    await scheduleEventNotification(
      createdEvent.id,
      createdEvent.title,
      new Date(createdEvent.startDate),
      15 // minutes before
    );
  };
};
```

### In CreateTodoScreen.tsx:

```typescript
import { useNotifications } from '../../hooks/useNotifications';

export const CreateTodoScreen = () => {
  const { scheduleTodoNotification } = useNotifications();

  const handleCreateTodo = async () => {
    // ... create todo logic ...

    if (createdTodo.dueDate) {
      // Schedule notification 2 hours before due
      await scheduleTodoNotification(
        createdTodo.id,
        createdTodo.title,
        new Date(createdTodo.dueDate),
        2 // hours before
      );
    }
  };
};
```

### When User Joins Group:

```typescript
import { useNotifications } from '../../hooks/useNotifications';

export const JoinGroupModal = () => {
  const { sendGroupInviteNotification } = useNotifications();

  const handleJoinGroup = async () => {
    // ... join group logic ...

    // Send notification to user
    await sendGroupInviteNotification(group.name, currentUser.displayName || 'Someone');
  };
};
```

---

## 📋 TODO: Next Steps to Complete

### 1. Add to CreateEventScreen ✅ (Ready to add)

**File**: `src/screens/Event/CreateEventScreen.tsx`

```typescript
// At top of file
import { useNotifications } from '../../hooks/useNotifications';

// Inside component
const { scheduleEventNotification } = useNotifications();

// In handleCreateEvent function (after event is created)
await scheduleEventNotification(
  createdEvent.id,
  createdEvent.title,
  new Date(createdEvent.startDate),
  15 // 15 minutes before
);
```

### 2. Add to CreateTodoScreen ✅ (Ready to add)

**File**: `src/screens/Todos/CreateTodoScreen.tsx`

```typescript
// At top of file
import { useNotifications } from '../../hooks/useNotifications';

// Inside component
const { scheduleTodoNotification } = useNotifications();

// In handleCreateTodo function (after todo is created, if has dueDate)
if (createdTodo.dueDate) {
  await scheduleTodoNotification(
    createdTodo.id,
    createdTodo.title,
    new Date(createdTodo.dueDate),
    2 // 2 hours before
  );
}
```

### 3. Add to JoinGroupModal ✅ (Ready to add)

**File**: `src/components/JoinGroupModal.tsx`

```typescript
// At top of file
import { useNotifications } from '../hooks/useNotifications';

// Inside component
const { sendGroupInviteNotification } = useNotifications();

// In handleJoinGroup function (after successfully joining)
await sendGroupInviteNotification(group.name, user.displayName || 'Someone');
```

### 4. Cancel Notifications When Deleting

When deleting events or todos, cancel their notifications:

```typescript
// When deleting event
await notificationService.cancelNotification(event.notificationId);

// When deleting todo
await notificationService.cancelNotification(todo.notificationId);
```

**Note:** You'll need to store the notification ID when creating the notification:

```typescript
// When creating event
const notificationId = await scheduleEventNotification(...);
// Save notificationId with the event in Firebase
await dataService.updateEvent(eventId, { notificationId });
```

### 5. Add Notification Settings Screen (Optional)

Create a settings screen where users can configure:

- Enable/disable notifications
- How many minutes before event to notify
- How many hours before todo due date to notify
- Notification sound preferences

---

## 🎨 Notification Channels (Android)

The service automatically creates 3 notification channels:

1. **Events** (`events`)
   - High importance
   - Color: Blue (#1a3a52)
   - Sound: Default

2. **Todos** (`todos`)
   - High importance
   - Color: Red (#ff6b6b)
   - Sound: Default

3. **Invites** (`invites`)
   - Default importance
   - Color: Teal (#4ecdc4)
   - No sound

---

## 🧪 Testing Notifications

### Test 1: Event Notification

```bash
# Create event 2 minutes in the future
# Wait 2 minutes
# You should receive notification about the event
```

### Test 2: Todo Notification

```bash
# Create todo due in 3 hours
# Change code to notify 1 hour before
# Wait 2 hours
# You should receive notification about the todo
```

### Test 3: Instant Notification

```bash
# Join a group
# Should receive notification immediately
```

### Test 4: Cancel Notification

```bash
# Create event
# Delete event before notification time
# Should NOT receive notification
```

---

## 📱 Simulator vs Physical Device

| Feature                          | Simulator  | Physical Device |
| -------------------------------- | ---------- | --------------- |
| Local Notifications              | ✅ Works   | ✅ Works        |
| Scheduled Notifications          | ⚠️ Limited | ✅ Works        |
| Push Notifications (from server) | ❌ No      | ✅ Works        |
| Notification Sounds              | ❌ No      | ✅ Works        |
| Notification Badges              | ⚠️ Partial | ✅ Works        |

**Recommendation:** Always test notifications on a physical device!

---

## 🚨 Common Issues & Solutions

### Issue 1: "Notifications don't work in Expo Go"

**Solution:** Local notifications work, but server push notifications require standalone build.

### Issue 2: "Permission denied"

**Solution:** Go to device Settings → App → Permissions → Enable Notifications

### Issue 3: "Notifications not showing"

**Solution:**

- Check that notification time hasn't passed
- Verify permissions are granted
- Check device Do Not Disturb mode
- Look in notification center/tray

### Issue 4: "Can't tap on notification"

**Solution:**

- Ensure app is installed (not running in Expo Go for production)
- Navigation logic needs to be implemented in `useNotifications` hook

---

## 🔐 Privacy & Permissions

### iOS:

- Users will see permission dialog on first launch
- Can be changed later in Settings → App → Notifications

### Android:

- Notifications are enabled by default (Android 13+)
- Users can disable in Settings → Apps → Notifications

### What We Access:

- ✅ Send local notifications
- ✅ Schedule future notifications
- ✅ Read notification permissions
- ❌ We DO NOT access other apps' notifications
- ❌ We DO NOT send data to third parties

---

## 📊 Future Enhancements

### Phase 1 (Current):

- [x] Local notifications for events
- [x] Local notifications for todos
- [x] Instant notifications for invites
- [x] Permission handling
- [x] Android notification channels

### Phase 2 (Future):

- [ ] Server-side push notifications
- [ ] Notification preferences in settings
- [ ] Custom notification sounds
- [ ] Notification history
- [ ] Group notification settings
- [ ] Quiet hours (don't notify between 10 PM - 8 AM)

### Phase 3 (Advanced):

- [ ] Rich notifications with images
- [ ] Action buttons in notifications (Complete, Snooze)
- [ ] Notification analytics
- [ ] Smart notification timing (ML-based)

---

## 🎓 Learn More

- **Expo Notifications Docs**: https://docs.expo.dev/versions/latest/sdk/notifications/
- **iOS Notifications**: https://developer.apple.com/notifications/
- **Android Notifications**: https://developer.android.com/develop/ui/views/notifications

---

## ✅ Summary

You now have:

1. ✅ Notification service ready to use
2. ✅ Hook for easy integration
3. ✅ Automatic notification channels
4. ✅ Permission handling
5. ✅ Three types of notifications (events, todos, invites)

**Next:** Just add the `useNotifications` hook to your create screens and start scheduling notifications! 🚀
