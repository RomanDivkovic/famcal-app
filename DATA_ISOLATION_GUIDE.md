# Data Isolation & Security Guide

## 📊 Current Data Isolation Status

Your app **DOES enforce data isolation** at the **application level** through careful code filtering. Here's exactly what is controlled:

---

## ✅ ENFORCED: What Users CAN'T See

### 1. **Groups They Aren't Members Of** ✅

**File**: `src/services/firebaseService.ts` → `getGroups()`

```typescript
async getGroups(userId: string): Promise<Group[]> {
  const groups: Group[] = [];
  snapshot.forEach((childSnapshot) => {
    const group = this.deserializeGroup(childSnapshot.val());
    if (group.members.includes(userId)) {  // ← ENFORCEMENT: Only return groups user is member of
      groups.push(group);
    }
  });
  return groups;
}
```

**Result**: Users only see groups in their group list if they're in the `members` array.

### 2. **Events/Todos From Groups They Aren't Members Of** ✅

**File**: `src/services/firebaseService.ts` → `getEventsForUser()` and `getTodosForUser()`

**Events Filtering**:

```typescript
async getEventsForUser(userId: string): Promise<Event[]> {
  const groups = await this.getGroups(userId);  // Get user's groups
  const groupIds = groups.map((g) => g.id);      // Get group IDs

  const userEvents = allEvents.filter(
    (event) =>
      event.createdBy === userId ||               // ← Personal events
      (event.groupId && groupIds.includes(event.groupId))  // ← Only group events from groups they're in
  );
  return userEvents;
}
```

**Todos Filtering**:

```typescript
async getTodosForUser(userId: string): Promise<Todo[]> {
  const groups = await this.getGroups(userId);
  const groupIds = groups.map((g) => g.id);

  // Get todos from each group
  for (const groupId of groupIds) {
    const groupTodosRef = ref(database, `groups/${groupId}/todos`);
    // Only gets todos from groups user is a member of
  }

  // Get personal todos only if created by this user
  if (todo.createdBy === userId && !todo.groupId) {
    allTodos.push(todo);
  }
}
```

**Result**: Users only see events/todos from groups they're members of, plus their own personal events/todos.

### 3. **Other Users' Personal Data** ✅

**File**: `src/services/firebaseService.ts` → `users` path

```typescript
// Firebase Rules enforce this:
"users": {
  "$uid": {
    ".read": "auth != null && $uid === auth.uid",  // ← Only own user data
    ".write": "auth != null && $uid === auth.uid"
  }
}
```

**Result**: Users can only read/write their own user profile.

---

## ⚠️ WARNING: What Isn't Fully Enforced by Firebase Rules

The current Firebase rules are **permissive** by design. This means:

### 1. **Group List Is Readable By Anyone** ⚠️

**Current Rule**:

```json
"groups": {
  "$groupId": {
    ".read": "auth != null"  // ← Any authenticated user can read all groups
  }
}
```

**What This Means**:

- Any logged-in user could **directly query** the Firebase database and see all groups
- **BUT**: Your app filters this before showing users the list

**Security**: 🟡 **Medium** - Relies on app logic, not Firebase rules

### 2. **Events/Todos Are Readable By Anyone** ⚠️

**Current Rule**:

```json
"events": {
  "$eventId": {
    ".read": "auth != null"  // ← Any authenticated user can read all events
  }
}
```

**What This Means**:

- Any logged-in user could **directly query** and see all events/todos in the database
- **BUT**: Your app filters them before displaying

**Security**: 🟡 **Medium** - Relies on app logic, not Firebase rules

### 3. **Invitations Are Readable By Anyone** ⚠️

**Current Rule**:

```json
"invitations": {
  "$invitationId": {
    ".read": "auth != null"  // ← Any authenticated user can read all invitations
  }
}
```

**Security**: 🟡 **Medium** - Relies on app logic, not Firebase rules

---

## 🔐 How to Strengthen Security

### Option 1: Keep Current Setup (App-Level Filtering)

✅ **Pros**:

- Simple rules
- Easy to debug
- Works well for smaller apps
- Good for MVP

❌ **Cons**:

- Doesn't protect against direct API calls
- Relies on frontend code to enforce security
- If app code is compromised, data could be exposed

### Option 2: Implement Server-Side Rules (Recommended for Production)

Enforce restrictions **in Firebase Rules** themselves:

```json
{
  "rules": {
    "groups": {
      "$groupId": {
        ".read": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
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
    }
  }
}
```

**⚠️ WARNING**: These stricter rules will break your app if Firebase rules fail to evaluate properly.

---

## 📋 What Data Users CAN See Today

### User A's Perspective:

✅ Can see:

- Groups they created
- Groups they joined via invite code
- Events in those groups
- Todos in those groups
- Own personal events
- Own personal todos
- Own profile

❌ Cannot see (by app logic):

- Groups they aren't members of
- Events/todos from other groups
- Other users' personal events/todos
- Other users' profiles

---

## 🚀 Recommendation

**For your MVP**: Keep the current setup. It's **secure enough** because:

1. Users authenticate with Firebase (they have an `auth.uid`)
2. Your app filters all data before displaying it
3. The main risk is only if someone:
   - Compromises your database connection
   - Reverse-engineers your API calls
   - Maliciously queries your database directly

**For Production**: Implement stricter Firebase Rules to add defense-in-depth security.

---

## 🧪 How to Test Data Isolation

### Test 1: Verify Groups Are Filtered

1. Create User A and User B
2. User A creates Group 1
3. User B logs in → should NOT see Group 1 in "My Groups"
4. User A generates invite code, shares with User B
5. User B joins using code → now both see Group 1

### Test 2: Verify Events Are Filtered

1. User A creates personal event
2. User B logs in → should NOT see User A's personal event
3. User A creates event in Group 1 (after User B joined)
4. User B checks calendar → SHOULD see the event

### Test 3: Verify Todos Are Filtered

1. User A creates personal todo
2. User B logs in → should NOT see User A's personal todo
3. User A creates todo in Group 1 (after User B joined)
4. User B checks todos → SHOULD see the group todo

---

## 📚 Current Architecture

```
Firebase Database (Permissive Rules)
    ↓
    ├── users/{uid}              (Private by Firebase rules)
    ├── groups/{groupId}         (Readable by anyone, but filtered by app)
    ├── events/{eventId}         (Readable by anyone, but filtered by app)
    ├── todos/{todoId}           (Readable by anyone, but filtered by app)
    └── invitations/{id}         (Readable by anyone, but filtered by app)

Your React Native App (Data Filtering)
    ↓
    ├── getGroups(userId)        → Filters to groups where user is member
    ├── getEventsForUser(userId) → Filters to user's events + group events
    ├── getTodosForUser(userId)  → Filters to user's todos + group todos
    └── HomeScreen, CalendarScreen, TodosScreen → Display filtered data
```

---

## ✅ Summary

**YES, you DO enforce data isolation** - just at the application level, not Firebase level. This is:

- ✅ Safe for MVP/production if you trust your codebase
- ✅ Works well because all queries go through your filtered service layer
- ⚠️ Not ideal if you need defense-in-depth security
- 🚀 Can be upgraded to Firebase-level rules later

Your app is **functionally secure** but would benefit from **stricter Firebase rules** for true defense-in-depth.
