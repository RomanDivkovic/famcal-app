# UI Improvements & Feature Roadmap

## ✅ Completed (Current Commit)

### Loading States

- ✅ Installed `lottie-react-native` for animations
- ✅ Created `LoadingOverlay` component using `loader.json` animation
- ✅ Integrated loading overlay into `LoginScreen` and `RegisterScreen`

### Error Handling

- ✅ Created `ErrorModal` component for displaying errors
- ✅ Replaced Alert.alert with ErrorModal in auth screens
- ✅ Shows errors both in modal and inline under text fields

### UI Fixes

- ✅ Fixed GroupCard border visibility in light mode (added border to Card component)
- ✅ Fixed Todos filter button text overflow (reduced padding, smaller font)
- ✅ Replaced dark mode toggle icon with proper Switch component in ProfileScreen
- ✅ Updated app icons and splash screen to use `famcal.png`
- ✅ Fixed escaped apostrophe in LoginScreen

## 🚧 Remaining Tasks

### 1. Password Change Functionality

**Location:** `ProfileScreen`
**Requirements:**

- Add "Change Password" option in Preferences section
- Create password change modal/screen with fields:
  - Current Password (validated against Firebase)
  - New Password (min 6 chars)
  - Confirm New Password (must match)
- Use Firebase `updatePassword()` method
- Show success/error feedback with ErrorModal

**Implementation:**

```typescript
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No user logged in');

  // Re-authenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPassword);
};
```

### 2. Enhanced Group Detail View

**Location:** `GroupDetailScreen` (needs to be created or enhanced)
**Current Issue:** Only shows group ID
**Requirements:**

- Show group information:
  - Group name and description
  - Color indicator
  - Member list with avatars/initials
  - Member count
- Show group settings:
  - Edit group (name, description, color)
  - Leave group option
  - Delete group (if owner)
- Show invite button (leads to invitation system)

**Firebase Structure:**

```typescript
groups/{groupId}/members/{userId} = {
  role: 'owner' | 'member',
  joinedAt: timestamp,
  displayName: string,
  email: string
}
```

### 3. Calendar Event Creation & Display

**Current Issues:**

- Events created don't appear in CalendarScreen
- Native calendar sync may not be working

**Requirements:**

- Debug event creation flow:
  1. Check if events are being saved to Firebase
  2. Check if CalendarScreen is fetching events correctly
  3. Verify expo-calendar permissions
- Ensure events sync to native calendar
- Ensure events from native calendar can be imported
- Add refresh functionality to CalendarScreen

**Investigation Steps:**

1. Check `dataService.createEvent()` implementation
2. Check `CalendarScreen` event loading logic
3. Verify calendar permissions in app.config.js
4. Test with console.logs to trace event flow

### 4. Native Calendar Integration Button

**Location:** `CalendarScreen`
**Requirements:**

- Add button to header or FAB that opens device's native calendar app
- Use `Linking.openURL()` with calendar URL scheme
- Handle iOS and Android differently:
  - iOS: `calshow://` or use `expo-calendar` to open specific event
  - Android: Intent-based with `content://com.android.calendar/time/`

**Implementation:**

```typescript
import { Linking, Platform } from 'react-native';

const openNativeCalendar = async () => {
  const url = Platform.select({
    ios: 'calshow://',
    android: 'content://com.android.calendar/time/',
  });

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
};
```

### 5. Group Invitation System

**This is the most complex feature remaining**

#### Requirements:

- Group owners/admins can invite users by email
- Invitation system with pending/accepted/declined states
- New users can create account and accept invitation
- Existing users receive notification and can accept/decline

#### Firebase Structure:

```typescript
invitations/{invitationId} = {
  groupId: string,
  groupName: string,
  invitedBy: userId,
  invitedEmail: string,
  status: 'pending' | 'accepted' | 'declined',
  createdAt: timestamp,
  expiresAt: timestamp  // 7 days from creation
}

users/{userId}/pendingInvitations = [invitationId, ...]
```

#### Implementation Options:

**Option A: Email with Deep Links (Recommended)**

1. Use Firebase Dynamic Links or custom deep linking
2. Send email using Firebase Cloud Functions (requires setup)
3. Email contains deep link: `groupcalendar://invite/{invitationId}`
4. Link opens app and shows invitation acceptance screen
5. If user doesn't have app, link goes to App Store/Play Store

**Setup Required:**

- Firebase Cloud Functions (for sending emails)
- Email template service (SendGrid, Mailgun, or Firebase Extensions)
- Deep linking configuration in app.config.js
- Universal Links (iOS) and App Links (Android)

**Option B: In-App Code System (Simpler, No External Setup)**

1. Generate unique 6-digit invitation code
2. Show code in app for group owners
3. New users enter code during registration or after login
4. App validates code and adds user to group

**Implementation:**

```typescript
// Generate invitation
const createInvitation = async (groupId: string, invitedEmail: string) => {
  const invitationId = generateId();
  const invitation = {
    groupId,
    invitedBy: currentUser.id,
    invitedEmail,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  await database.ref(`invitations/${invitationId}`).set(invitation);
  await database
    .ref(`users/${invitedEmail.replace('@', '_')}/pendingInvitations/${invitationId}`)
    .set(true);

  // Option A: Send email via Cloud Function
  // await functions.httpsCallable('sendInvitationEmail')({ invitationId, invitedEmail });

  // Option B: Return invitation code to show in app
  return { invitationId, code: generateCode(invitationId) };
};

// Accept invitation
const acceptInvitation = async (invitationId: string) => {
  const invitation = await database.ref(`invitations/${invitationId}`).once('value');
  const data = invitation.val();

  if (!data || data.status !== 'pending') {
    throw new Error('Invalid invitation');
  }

  if (data.expiresAt < Date.now()) {
    throw new Error('Invitation expired');
  }

  // Add user to group
  await database.ref(`groups/${data.groupId}/members/${currentUser.id}`).set({
    role: 'member',
    joinedAt: Date.now(),
    displayName: currentUser.displayName,
    email: currentUser.email,
  });

  // Update invitation status
  await database.ref(`invitations/${invitationId}/status`).set('accepted');
};
```

**UI Components Needed:**

1. `InviteMemberScreen` - Form to invite by email or show code
2. `PendingInvitationsScreen` - List of invitations received
3. `InvitationDetailModal` - Show invitation details and accept/decline
4. Add invitation badge/indicator in HomeScreen or Profile

#### Recommendation for Invitation System:

Start with **Option B (In-App Code)** as it requires no external setup and is more secure (no email interception). You can add email functionality later using Firebase Extensions (easy to set up, no Cloud Functions coding needed).

## Testing Checklist

After implementing remaining features, test:

- [ ] Loading overlay appears during login/register
- [ ] Error modal shows for failed auth attempts
- [ ] Dark mode switch works properly
- [ ] GroupCard borders visible in light mode
- [ ] Todos filter buttons display correctly
- [ ] App icon/splash screen uses famcal.png
- [ ] Password change validates and updates
- [ ] Group detail shows all information
- [ ] Events appear in CalendarScreen after creation
- [ ] Native calendar button opens device calendar
- [ ] Invitation system works end-to-end

## Next Steps Priority

1. **High Priority:** Group detail view (improves UX immediately)
2. **High Priority:** Calendar event debugging (core feature)
3. **Medium Priority:** Password change (security feature)
4. **Medium Priority:** Native calendar button (nice-to-have)
5. **Low Priority:** Invitation system (complex, can be MVP first)
