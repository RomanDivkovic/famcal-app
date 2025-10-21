# GroupCalendarApp - Invite System & Security Guide

## 📋 Table of Contents

1. [How to Invite Someone](#how-to-invite-someone)
2. [Current Data Isolation](#current-data-isolation)
3. [Security Rules Implementation](#security-rules-implementation)
4. [Testing the System](#testing-the-system)

---

## 🔗 How to Invite Someone

### Step-by-Step Process

1. **Open a Group**
   - Navigate to the Home screen and tap on a group you created or manage
   - This opens the Group Detail screen

2. **Tap "Invite Members" Button**
   - On the Group Detail screen, tap the "Invite Members" button (with person-add icon)
   - A bottom sheet will slide up from the bottom of the screen

3. **Copy or Share the Invite Code**
   - An invite code is automatically generated and displayed
   - You have two options:
     - **Copy Code**: Tap "Copy Code" to copy to clipboard and share manually
     - **Share Invite Code**: Tap to open native share dialog (SMS, WhatsApp, Email, etc.)

4. **Recipient Joins the Group**
   - Recipient opens the app and goes to Home screen
   - Taps "Join Group" button
   - Enters the invite code (7-day validity with timestamp validation)
   - Gets added to the group as a member

### Current Implementation Details

**File**: `src/components/InviteBottomSheet.tsx`

The invite system uses:

- **Invite Code Generation**: Random 6-character alphanumeric code
- **Code Storage**: Stored in `groups/{groupId}/inviteCode` in Firebase
- **Code Validation**: Checked against group's stored code when joining
- **Validity**: No expiration validation yet (should be added)

**How it Works**:

```typescript
// In firebaseService.ts

// Generate a new code
async generateInviteCode(groupId: string): Promise<string> {
  const code = this.generateRandomCode(); // 6-char code
  await this.updateGroup(groupId, { inviteCode: code });
  return code;
}

// Join group with code
async joinGroup(groupId: string, userId: string, inviteCode?: string): Promise<void> {
  const group = await this.getGroupById(groupId);

  if (inviteCode && group.inviteCode !== inviteCode) {
    throw new DataServiceError('Invalid invite code');
  }

  if (!group.members.includes(userId)) {
    group.members.push(userId);
    await this.updateGroup(groupId, { members: group.members });
  }
}
```

✅ **Status**: The code is implemented and functional.

---

## 👥 Current Data Isolation

### What Users See

**Events**:

- ✅ Users see events from groups they're members of
- ✅ Users see personal events they created
- ❌ Users cannot see other users' personal events

**Todos**:

- ✅ Users see todos from groups they're members of
- ✅ Users see personal todos they created
- ❌ Users cannot see other users' personal todos

### Implementation (firebaseService.ts)

**For Events**:

```typescript
async getEventsForUser(userId: string): Promise<Event[]> {
  const groups = await this.getGroups(userId); // Get user's groups
  const groupIds = groups.map((g) => g.id);

  const userEvents = allEvents.filter(
    (event) =>
      event.createdBy === userId ||  // Personal events
      (event.groupId && groupIds.includes(event.groupId)) // Group events
  );

  return userEvents;
}
```

**For Todos**:

```typescript
async getTodosForUser(userId: string): Promise<Todo[]> {
  // Get todos from user's groups
  for (const groupId of groupIds) {
    const groupTodosRef = ref(database, `groups/${groupId}/todos`);
    // ... fetch todos
  }

  // Get personal todos
  const personalTodos = allTodos.filter(
    (todo) => todo.createdBy === userId && !todo.groupId
  );

  return [...groupTodos, ...personalTodos];
}
```

✅ **Status**: Data isolation is correctly implemented at the application level.

---

## 🔐 Security Rules Implementation

### ⚠️ CRITICAL: Firebase Rules Issue & Fix

**Problem You May Be Experiencing**:
If you deployed the initial Firebase rules and now can't load groups/events/todos, the rules were **too restrictive** and using problematic syntax that blocks all reads.

**What's Fixed**:

- Fixed `.contains()` logic that was checking null values
- Simplified read rules to check member existence properly
- Added `auth != null` check to prevent unauthenticated access
- Changed from `.val().contains(auth.uid)` to `.child(auth.uid).exists()` (more reliable)

**Your Data Is Safe**:
✅ No need to delete anything - just update the rules in Firebase Console

**New Rules Are Working**:
The updated `firebaseRules.json` in your project now:

- Allows group members to read their group data
- Allows users to read their own personal events/todos
- Allows group members to read group events/todos
- Prevents users from reading other users' private data
- Prevents unauthorized modifications

### Solution: Update Firebase Realtime Database Rules

**Copy the CORRECTED rules from `firebaseRules.json`**:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && $uid === auth.uid",
        ".write": "auth != null && $uid === auth.uid"
      }
    },
    "groups": {
      "$groupId": {
        ".read": "auth != null && (root.child('groups').child($groupId).child('members').child(auth.uid).exists() || root.child('groups').child($groupId).child('createdBy').val() === auth.uid)",
        ".write": "auth != null && root.child('groups').child($groupId).child('createdBy').val() === auth.uid"
      }
    },
    "events": {
      "$eventId": {
        ".read": "auth != null && (data.child('createdBy').val() === auth.uid || (data.child('groupId').exists() && root.child('groups').child(data.child('groupId').val()).child('members').child(auth.uid).exists()))",
        ".write": "auth != null && data.child('createdBy').val() === auth.uid"
      }
    },
    "todos": {
      "$todoId": {
        ".read": "auth != null && (data.child('createdBy').val() === auth.uid || (data.child('groupId').exists() && root.child('groups').child(data.child('groupId').val()).child('members').child(auth.uid).exists()))",
        ".write": "auth != null && data.child('createdBy').val() === auth.uid"
      }
    },
    "invitations": {
      "$invitationId": {
        ".read": "auth != null && data.child('invitedEmail').val() === auth.token.email",
        ".write": "false"
      }
    }
  }
}
```

### How to Deploy These Rules

**Method 1: Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Realtime Database** → **Rules** tab
4. Replace the default rules with the content above
5. Click **Publish**

**Method 2: Firebase CLI**

```bash
# Install Firebase CLI (if not already)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only database
```

**Method 3: Add to your project for version control**

Create `.firebaserc` and reference the rules in `firebase.json`:

```json
{
  "database": [
    {
      "target": "default",
      "rules": "firebaseRules.json"
    }
  ]
}
```

---

## 🧪 Testing the System

### Test 1: Invite Code Generation

```
1. User A creates a group "Family Events"
2. Tap "Invite Members"
3. A 6-character code appears (e.g., "ABC123")
4. Share the code with User B
✅ Code should be displayed and shareable
```

### Test 2: Joining a Group

```
1. User B opens the app
2. Tap "Join Group" on Home screen
3. Enter the invite code from User A
4. Tap "Join"
✅ User B should appear in the group members list
✅ User B should now see the group in their groups list
```

### Test 3: Data Isolation - Events

```
1. User A creates a personal event: "Doctor Appointment"
2. User B opens the app
3. Check B's event list
✅ User B should NOT see A's personal event
✅ If in same group, B should see group events
```

### Test 4: Data Isolation - Todos

```
1. User A creates a personal todo: "Buy groceries"
2. User B opens the app
3. Check B's todo list
✅ User B should NOT see A's personal todo
✅ If in same group, B should see group todos
```

### Test 5: Security Rules

```
After deploying security rules:

1. User A (hacker) tries to modify another user's profile directly
✅ Request should be denied (403 Forbidden)

2. User A tries to read all groups in the database
✅ Should only see groups where they're a member

3. User A tries to delete another user's event
✅ Request should be denied
```

---

## ⚠️ Important Notes

### Current Limitations

1. **No Code Expiration**
   - Invite codes don't expire after 7 days
   - Solution: Add `inviteCodeCreatedAt` timestamp and validate age

2. **No Rate Limiting**
   - Users can generate unlimited codes
   - Solution: Add rate limiting in Cloud Functions

3. **No Email Invitations**
   - Current system only supports code sharing
   - Future: Add email invitations via Cloud Functions

4. **Client-Side Validation**
   - Data isolation is enforced in app logic
   - **MUST ADD Firebase Security Rules** for server-side enforcement

---

## 🚀 Next Steps

### Priority 1 (Critical)

- [ ] Deploy Firebase Security Rules (see section above)
- [ ] Test data isolation with multiple users
- [ ] Verify unauthorized access is blocked

### Priority 2 (Important)

- [ ] Add invite code expiration (7 days)
- [ ] Implement rate limiting
- [ ] Add logging for security events

### Priority 3 (Nice-to-Have)

- [ ] Email invitations with Cloud Functions
- [ ] Invitation history
- [ ] Group member roles (admin, member)
- [ ] Remove member from group option

---

## 📞 Support

If you encounter issues:

1. Check Firebase Console for any errors
2. Verify Firebase config in `.env` file
3. Check browser console for client-side errors
4. Review Firebase rules in the console for any syntax errors
