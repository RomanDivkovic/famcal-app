# Invite Code System - How It Works

## Overview

The invite code system allows users to invite others to join their groups through a secure, time-limited code.

## System Architecture

### 1. **Data Structure** (Firebase Realtime Database)

```
groups/
  {groupId}/
    name: "My Family"
    description: "Our family calendar"
    members:
      {userId1}: true
      {userId2}: true
    createdBy: {userId}
    createdAt: "2024-01-01T00:00:00.000Z"
    inviteCode: "ABC12345"              // 8-character code
    inviteCodeCreatedAt: "2024-01-01..."  // When code was generated
```

### 2. **Code Generation** (`generateInviteCode`)

**Location**: `/src/services/firebaseService.ts`

```typescript
async generateInviteCode(groupId: string): Promise<string> {
  const code = this.generateRandomCode(); // Generates 8-char alphanumeric
  await this.updateGroup(groupId, {
    inviteCode: code,
    inviteCodeCreatedAt: new Date(),
  });
  return code;
}
```

**Key Points**:

- Generates a random 8-character alphanumeric code
- Stores the code AND timestamp in the group
- Returns the code to display to the user

### 3. **Code Lookup** (`findGroupByInviteCode`)

**Location**: `/src/services/firebaseService.ts`

**⚠️ IMPORTANT**: This now uses simple iteration instead of Firebase indexed queries for immediate compatibility.

```typescript
async findGroupByInviteCode(inviteCode: string): Promise<Group | null> {
  const groupsRef = ref(database, 'groups');
  const snapshot = await get(groupsRef);

  if (!snapshot.exists()) return null;

  // Iterate through all groups to find matching invite code
  let foundGroup: Group | null = null;
  snapshot.forEach((childSnapshot) => {
    const groupData = childSnapshot.val();
    if (groupData.inviteCode === inviteCode) {
      foundGroup = this.deserializeGroup(groupData);
    }
  });

  return foundGroup;
}
```

**Key Points**:

- Searches ALL groups for matching invite code
- No Firebase index required (works immediately)
- Returns the group if found, null if not
- For 1000+ groups, consider adding Firebase index (see INVITE_FIX_APPLIED.md)

### 4. **Joining a Group** (`joinGroup`)

**Location**: `/src/services/firebaseService.ts`

```typescript
async joinGroup(groupId: string, userId: string, inviteCode?: string): Promise<void> {
  const group = await this.getGroupById(groupId);

  if (!group) {
    throw new DataServiceError('Group not found');
  }

  if (inviteCode) {
    // Validate code matches
    if (group.inviteCode !== inviteCode) {
      throw new DataServiceError('Invalid invite code');
    }

    // Check expiration (7 days)
    if (group.inviteCodeCreatedAt) {
      const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7 days
      const codeAge = Date.now() - new Date(group.inviteCodeCreatedAt).getTime();

      if (codeAge > expirationTime) {
        throw new DataServiceError('Invite code has expired');
      }
    }
  }

  // Add user to group
  if (!group.members[userId]) {
    const updates = {};
    updates[`/groups/${groupId}/members/${userId}`] = true;
    updates[`/user-groups/${userId}/${groupId}`] = true;
    await update(ref(database), updates);
  }
}
```

**Key Points**:

- Validates the invite code matches
- Checks if code is expired (7 days max)
- Adds user to group members
- Creates bi-directional reference (group->user and user->group)

## User Flow

### **Inviting Flow** (Group Owner/Member)

1. User opens GroupDetailScreen
2. Clicks "Invite Members" button
3. `InviteBottomSheet` opens
4. Hook `useInviteCode` runs:
   - **Checks if group already has a code**
   - If yes: Displays existing code + expiration info
   - If no: Generates new code automatically
5. User can:
   - Copy code to clipboard
   - Share via native share dialog
   - Generate new code (invalidates old one)

### **Joining Flow** (New Member)

1. User receives invite code (via text, email, etc.)
2. Opens app and goes to Home screen
3. Clicks "Join Group" button (enter icon in header)
4. `JoinGroupBottomSheet` opens
5. User enters the 8-character code
6. Hook `useJoinGroup` validates:
   - Code format (8 characters)
   - Finds group by code (`findGroupByInviteCode`)
   - Checks user isn't already a member
   - Calls `joinGroup` which validates expiration
7. If successful:
   - User added to group members
   - Group appears in their groups list
   - Can now see events, todos, and members

## Code Expiration

### **How It Works**:

- When code is generated, `inviteCodeCreatedAt` timestamp is stored
- When joining, server checks if `Date.now() - inviteCodeCreatedAt > 7 days`
- If expired, join is rejected
- User must request new code from group owner

### **Automatic Cleanup** (Not Yet Implemented):

- Could use Firebase Cloud Functions to auto-delete expired codes
- Or clean up on next code generation

### **Manual Refresh**:

- Group owner can generate new code anytime
- Old code becomes invalid immediately
- New 7-day timer starts

## Security Features

1. **Random 8-Character Codes**: Hard to guess
2. **Time-Limited**: Expires after 7 days
3. **Single-Use Validation**: Code checked on join
4. **Group Ownership**: Only valid for specific group
5. **Indexed Search**: Fast lookup without exposing all groups

## Firebase Database Rules (Recommended)

```json
{
  "rules": {
    "groups": {
      "$groupId": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": "auth != null && data.child('members').child(auth.uid).exists()",
        "inviteCode": {
          ".read": "true" // Anyone can read to validate
        }
      }
    }
  }
}
```

## Common Issues & Solutions

### Issue 1: "Code generates every time I open invite modal"

**Fixed**: Hook now loads existing code first, only generates if missing

### Issue 2: "How does the code connect to the group?"

**Answer**: Code is stored in the group document. When joining, we search all groups for matching code.

### Issue 3: "Where does code get deleted after 7 days?"

**Answer**: Code stays in database but is validated on join. Expiration check prevents use after 7 days.

### Issue 4: "How does group know about new member?"

**Answer**: `joinGroup` adds userId to group's `members` object, making them part of the group.

## Testing Checklist

- [ ] Generate invite code
- [ ] Code persists across app restarts
- [ ] Code can be copied and shared
- [ ] New user can join with valid code
- [ ] Expired code (>7 days) is rejected
- [ ] Invalid code is rejected
- [ ] User can't join same group twice
- [ ] Generating new code invalidates old code
- [ ] Days remaining shows correctly
- [ ] Expired code shows warning
