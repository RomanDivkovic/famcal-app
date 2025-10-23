/**
 * Firebase Service Implementation
 * Implements IDataService using Firebase Realtime Database / Firestore
 */

import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { ref, set, get, update, remove, push, onValue } from 'firebase/database';
import { auth, database } from './firebaseConfig';
import { IDataService, DataServiceError } from './IDataService';
import { User, Group, Event, Todo, Invitation } from '../types';

/**
 * Firebase implementation of the data service
 * Uses Firebase Realtime Database for data storage
 */
class FirebaseService implements IDataService {
  // ==================== AUTHENTICATION ====================

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
      };

      // Store user data in database using serializer to convert Date properly
      console.info('Saving user to database:', user);
      await set(ref(database, `users/${user.id}`), this.serializeUser(user));
      console.info('User saved successfully to database');

      return user;
    } catch (error: any) {
      // Provide user-friendly error messages
      let message = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      }
      throw new DataServiceError(message, error.code, error);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      // Provide user-friendly error messages
      let message = 'Failed to sign in';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later';
      }
      throw new DataServiceError(message, error.code, error);
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      // Note: Google Sign-in requires a custom development build
      // It cannot work with Expo Go due to native module requirements
      throw new DataServiceError(
        'Google sign-in is not available in Expo Go. Please use email/password authentication or create a development build.',
        'NOT_SUPPORTED'
      );
    } catch (error: any) {
      throw new DataServiceError(
        error.message || 'Failed to sign in with Google',
        error.code,
        error
      );
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new DataServiceError('Failed to sign out', error.code, error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      return this.mapFirebaseUser(firebaseUser);
    } catch (error: any) {
      throw new DataServiceError('Failed to get current user', error.code, error);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      console.info('getUserById called with userId:', userId);
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      console.info('getUserById snapshot exists:', snapshot.exists());
      if (!snapshot.exists()) {
        console.warn('getUserById: No data found for user:', userId);
        return null;
      }

      const userData = this.deserializeUser(snapshot.val());
      console.info('getUserById returning user data:', userData);
      return userData;
    } catch (error: any) {
      console.error('getUserById error:', error);
      throw new DataServiceError('Failed to get user by ID', error.code, error);
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, updates);
    } catch (error: any) {
      throw new DataServiceError('Failed to update user profile', error.code, error);
    }
  }

  async deleteAccount(password: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new DataServiceError('No authenticated user found');
      }

      // Re-authenticate user with password
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      const userId = currentUser.uid;

      // Delete user data from database
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);

      // Delete all user's events
      const eventsRef = ref(database, 'events');
      const eventsSnapshot = await get(eventsRef);
      if (eventsSnapshot.exists()) {
        const deletions: Promise<void>[] = [];
        eventsSnapshot.forEach((childSnapshot) => {
          const event = childSnapshot.val();
          if (event.createdBy === userId) {
            deletions.push(remove(ref(database, `events/${childSnapshot.key}`)));
          }
        });
        await Promise.all(deletions);
      }

      // Delete all user's todos
      const todosRef = ref(database, 'todos');
      const todosSnapshot = await get(todosRef);
      if (todosSnapshot.exists()) {
        const deletions: Promise<void>[] = [];
        todosSnapshot.forEach((childSnapshot) => {
          const todo = childSnapshot.val();
          if (todo.createdBy === userId) {
            deletions.push(remove(ref(database, `todos/${childSnapshot.key}`)));
          }
        });
        await Promise.all(deletions);
      }

      // Remove user from all groups
      const groupsRef = ref(database, 'groups');
      const groupsSnapshot = await get(groupsRef);
      if (groupsSnapshot.exists()) {
        const updates: { [key: string]: any } = {};
        groupsSnapshot.forEach((childSnapshot) => {
          const group = childSnapshot.val();
          if (group.members && group.members[userId]) {
            updates[`groups/${childSnapshot.key}/members/${userId}`] = null;
          }
        });
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates);
        }
      }

      // Finally, delete the Firebase auth user
      await deleteUser(currentUser);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new DataServiceError('Incorrect password. Please try again.', error.code, error);
      }
      throw new DataServiceError('Failed to delete account', error.code, error);
    }
  }

  // ==================== GROUPS ====================

  async getGroups(userId: string): Promise<Group[]> {
    try {
      const userGroupsRef = ref(database, `user-groups/${userId}`);
      const snapshot = await get(userGroupsRef);

      if (!snapshot.exists()) return [];

      const groupIds = Object.keys(snapshot.val());
      const groupPromises = groupIds.map((groupId) => this.getGroupById(groupId));
      const groups = (await Promise.all(groupPromises)).filter((g): g is Group => g !== null);

      return groups;
    } catch (error: any) {
      throw new DataServiceError('Failed to get groups', (error as any).code, error);
    }
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    try {
      const groupRef = ref(database, `groups/${groupId}`);
      const snapshot = await get(groupRef);

      if (!snapshot.exists()) return null;

      return this.deserializeGroup(snapshot.val());
    } catch (error: any) {
      throw new DataServiceError('Failed to get group', error.code, error);
    }
  }

  async findGroupByInviteCode(inviteCode: string): Promise<Group | null> {
    try {
      console.info('[FirebaseService] Searching for group with invite code:', inviteCode);

      const groupsRef = ref(database, 'groups');
      const snapshot = await get(groupsRef);

      if (!snapshot.exists()) {
        console.warn('[FirebaseService] No groups found in database');
        return null;
      }

      // Iterate through all groups to find matching invite code
      let foundGroup: Group | null = null;
      snapshot.forEach((childSnapshot) => {
        const groupData = childSnapshot.val();
        console.info(
          '[FirebaseService] Checking group:',
          groupData.id,
          'code:',
          groupData.inviteCode
        );

        if (groupData.inviteCode === inviteCode) {
          foundGroup = this.deserializeGroup(groupData);
          console.info('[FirebaseService] Found matching group:', foundGroup.id);
        }
      });

      if (!foundGroup) {
        console.warn('[FirebaseService] No group found with code:', inviteCode);
      }

      return foundGroup;
    } catch (error: any) {
      console.error('[FirebaseService] Error finding group by invite code:', error);
      throw new DataServiceError('Failed to find group by invite code', error.code, error);
    }
  }

  async createGroup(name: string, description: string, userId: string): Promise<Group> {
    try {
      const groupsRef = ref(database, 'groups');
      const newGroupRef = push(groupsRef);
      const groupId = newGroupRef.key!;

      const group: Group = {
        id: groupId,
        name,
        description,
        members: { [userId]: true },
        createdBy: userId,
        createdAt: new Date(),
        inviteCode: this.generateRandomCode(),
      };

      console.log('[FirebaseService] Creating group:', group);
      console.log('[FirebaseService] User ID:', userId);

      // Use a multi-path update to write to groups and user-groups atomically
      const updates: { [key: string]: any } = {};
      updates[`/groups/${groupId}`] = this.serializeGroup(group);
      updates[`/user-groups/${userId}/${groupId}`] = true;

      console.log('[FirebaseService] Updates to apply:', JSON.stringify(updates, null, 2));

      await update(ref(database), updates);

      console.log('[FirebaseService] Group created successfully');
      return group;
    } catch (error: any) {
      console.error('[FirebaseService] Create group error:', error);
      console.error('[FirebaseService] Error code:', error?.code);
      console.error('[FirebaseService] Error message:', error?.message);
      throw new DataServiceError(
        `Failed to create group: ${error?.message || 'Unknown error'}`,
        (error as any).code,
        error
      );
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    try {
      const groupRef = ref(database, `groups/${groupId}`);
      await update(groupRef, updates);
    } catch (error: unknown) {
      throw new DataServiceError('Failed to update group', (error as any).code, error);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const groupRef = ref(database, `groups/${groupId}`);
      await remove(groupRef);

      // Also delete associated events and todos
      const eventsRef = ref(database, 'events');
      const todosRef = ref(database, 'todos');

      // Note: In production, use Cloud Functions for cascading deletes
      // This is a simplified version
    } catch (error: any) {
      throw new DataServiceError('Failed to delete group', error.code, error);
    }
  }

  async joinGroup(groupId: string, userId: string, inviteCode?: string): Promise<void> {
    try {
      const group = await this.getGroupById(groupId);

      if (!group) {
        throw new DataServiceError('Group not found');
      }

      if (inviteCode) {
        if (group.inviteCode !== inviteCode) {
          throw new DataServiceError('Invalid invite code');
        }

        // Check if invite code has expired (7 days)
        if (group.inviteCodeCreatedAt) {
          const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
          const codeAge = Date.now() - new Date(group.inviteCodeCreatedAt).getTime();

          if (codeAge > expirationTime) {
            throw new DataServiceError('Invite code has expired. Please request a new one.');
          }
        }
      }

      if (!group.members[userId]) {
        // Use a multi-path update to add user to group and user-groups index
        const updates: { [key: string]: any } = {};
        updates[`/groups/${groupId}/members/${userId}`] = true;
        updates[`/user-groups/${userId}/${groupId}`] = true;
        await update(ref(database), updates);
      }
    } catch (error: any) {
      throw new DataServiceError('Failed to join group', (error as any).code, error);
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await this.getGroupById(groupId);

      if (!group) {
        throw new DataServiceError('Group not found');
      }

      // Use a multi-path update to remove user from group and user-groups index
      const updates: { [key: string]: any } = {};
      updates[`/groups/${groupId}/members/${userId}`] = null;
      updates[`/user-groups/${userId}/${groupId}`] = null;
      await update(ref(database), updates);

      // Check if group is now empty
      const remainingMembersRef = ref(database, `groups/${groupId}/members`);
      const snapshot = await get(remainingMembersRef);
      if (!snapshot.exists() || !snapshot.hasChildren()) {
        await this.deleteGroup(groupId);
      }
    } catch (error: any) {
      throw new DataServiceError('Failed to leave group', (error as any).code, error);
    }
  }

  async generateInviteCode(groupId: string): Promise<string> {
    try {
      const code = this.generateRandomCode();
      // Store both the code and when it was created for expiration validation
      await this.updateGroup(groupId, {
        inviteCode: code,
        inviteCodeCreatedAt: new Date(),
      });
      return code;
    } catch (error: any) {
      throw new DataServiceError('Failed to generate invite code', error.code, error);
    }
  }

  // ==================== EVENTS ====================

  async getEvents(groupId?: string): Promise<Event[]> {
    try {
      const eventsRef = ref(database, 'events');
      const snapshot = await get(eventsRef);

      if (!snapshot.exists()) return [];

      const events: Event[] = [];
      snapshot.forEach((childSnapshot) => {
        const event = this.deserializeEvent(childSnapshot.val());
        if (!groupId || event.groupId === groupId) {
          events.push(event);
        }
      });

      return events;
    } catch (error: any) {
      throw new DataServiceError('Failed to get events', error.code, error);
    }
  }

  async getEventById(eventId: string): Promise<Event | null> {
    try {
      console.info('[FirebaseService] getEventById:', eventId);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('[FirebaseService] No user logged in');
        return null;
      }

      // Try personal events under user first
      try {
        const personalEventRef = ref(
          database,
          `users/${currentUser.uid}/personal-events/${eventId}`
        );
        const personalSnapshot = await get(personalEventRef);
        if (personalSnapshot.exists()) {
          console.info('[FirebaseService] Found event at /users/{uid}/personal-events/');
          return this.deserializeEvent(personalSnapshot.val());
        }
      } catch (personalError) {
        console.warn('[FirebaseService] Could not check personal events:', personalError);
      }

      // Search all user's groups for the event
      try {
        const groups = await this.getGroups(currentUser.uid);
        console.info(`[FirebaseService] Searching ${groups.length} groups for event`);

        // Fetch all group events in parallel
        const groupEventPromises = groups.map(group => {
          const groupEventRef = ref(database, `groups/${group.id}/events/${eventId}`);
          return get(groupEventRef)
            .then(snapshot => ({ group, snapshot }))
            .catch(error => ({ group, error, snapshot: null }));
        });
        const results = await Promise.allSettled(groupEventPromises);
        for (const result of results) {
          if (
            result.status === 'fulfilled' &&
            result.value.snapshot &&
            result.value.snapshot.exists()
          ) {
            const { group, snapshot } = result.value;
            console.info(
              `[FirebaseService] Found event at /groups/${group.id}/events/ (${group.name})`
            );
            return this.deserializeEvent(snapshot.val());
          }
        }
      } catch (groupsError) {
        console.warn('[FirebaseService] Could not search user groups:', groupsError);
      }

      // Try root events as fallback (legacy support)
      try {
        const rootEventRef = ref(database, `events/${eventId}`);
        const rootSnapshot = await get(rootEventRef);
        if (rootSnapshot.exists()) {
          console.info('[FirebaseService] Found event at /events/');
          return this.deserializeEvent(rootSnapshot.val());
        }
      } catch (rootError) {
        console.warn('[FirebaseService] Could not check root events:', rootError);
      }

      console.warn('[FirebaseService] Event not found in any location:', eventId);
      return null;
    } catch (error: any) {
      console.error('[FirebaseService] Error getting event:', error);
      throw new DataServiceError('Failed to get event', error.code, error);
    }
  }

  async getEventsForUser(userId: string): Promise<Event[]> {
    try {
      console.info('[FirebaseService] Getting events for user:', userId);

      const userEvents: Event[] = [];

      // 1. Get personal events from /users/{userId}/personal-events
      const personalEventsRef = ref(database, `users/${userId}/personal-events`);
      const personalSnapshot = await get(personalEventsRef);

      if (personalSnapshot.exists()) {
        personalSnapshot.forEach((childSnapshot) => {
          userEvents.push(this.deserializeEvent(childSnapshot.val()));
        });
      }

      // 2. Get group events from /groups/{groupId}/events for each group
      const groups = await this.getGroups(userId);
      const groupIds = groups.map((g) => g.id);
      console.info('[FirebaseService] User group IDs:', groupIds);

      for (const groupId of groupIds) {
        const groupEventsRef = ref(database, `groups/${groupId}/events`);
        const snapshot = await get(groupEventsRef);

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            userEvents.push(this.deserializeEvent(childSnapshot.val()));
          });
        }
      }

      console.info('[FirebaseService] Filtered events for user:', userEvents.length);
      return userEvents;
    } catch (error: any) {
      console.error('[FirebaseService] Error getting events for user:', error);
      throw new DataServiceError('Failed to get events for user', error.code, error);
    }
  }

  async getEventsInDateRange(startDate: Date, endDate: Date, userId: string): Promise<Event[]> {
    try {
      const events = await this.getEventsForUser(userId);

      return events.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);

        return (
          (eventStart >= startDate && eventStart <= endDate) ||
          (eventEnd >= startDate && eventEnd <= endDate) ||
          (eventStart <= startDate && eventEnd >= endDate)
        );
      });
    } catch (error: any) {
      throw new DataServiceError('Failed to get events in date range', error.code, error);
    }
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      console.info('[FirebaseService] Creating event:', event);

      let eventsRef;
      let eventPath;

      // If event has no groupId, it's a personal event - store under user
      if (!event.groupId) {
        eventsRef = ref(database, `users/${event.createdBy}/personal-events`);
        eventPath = `users/${event.createdBy}/personal-events`;
      } else {
        // Group event - store under the group
        eventsRef = ref(database, `groups/${event.groupId}/events`);
        eventPath = `groups/${event.groupId}/events`;
      }

      const newEventRef = push(eventsRef);

      if (!newEventRef.key) {
        throw new Error('Failed to generate event key');
      }

      const newEvent: Event = {
        ...event,
        id: newEventRef.key,
      };

      const serialized = this.serializeEvent(newEvent);
      console.info('[FirebaseService] Serialized event:', serialized);
      console.info('[FirebaseService] Saving to path:', eventPath);

      await set(newEventRef, serialized);
      console.info('[FirebaseService] Event saved successfully with ID:', newEvent.id);

      return newEvent;
    } catch (error: any) {
      console.error('[FirebaseService] Error creating event:', error);
      throw new DataServiceError(
        `Failed to create event: ${error?.message || 'Unknown error'}`,
        error.code,
        error
      );
    }
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    try {
      const eventRef = ref(database, `events/${eventId}`);
      await update(eventRef, this.serializeEvent(updates as any));
    } catch (error: any) {
      throw new DataServiceError('Failed to update event', error.code, error);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const eventRef = ref(database, `events/${eventId}`);
      await remove(eventRef);
    } catch (error: any) {
      throw new DataServiceError('Failed to delete event', error.code, error);
    }
  }

  // ==================== TODOS ====================

  async getTodos(groupId?: string): Promise<Todo[]> {
    try {
      if (groupId) {
        // Get todos for a specific group
        const groupTodosRef = ref(database, `groups/${groupId}/todos`);
        const snapshot = await get(groupTodosRef);

        if (!snapshot.exists()) return [];

        const todos: Todo[] = [];
        snapshot.forEach((childSnapshot) => {
          todos.push(this.deserializeTodo(childSnapshot.val()));
        });

        return todos;
      } else {
        // Get all todos (from top-level for personal todos)
        const todosRef = ref(database, 'todos');
        const snapshot = await get(todosRef);

        if (!snapshot.exists()) return [];

        const todos: Todo[] = [];
        snapshot.forEach((childSnapshot) => {
          todos.push(this.deserializeTodo(childSnapshot.val()));
        });

        return todos;
      }
    } catch (error: any) {
      throw new DataServiceError('Failed to get todos', error.code, error);
    }
  }

  async getTodoById(todoId: string, groupId?: string): Promise<Todo | null> {
    try {
      console.info('[FirebaseService] getTodoById:', todoId, 'groupId:', groupId);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('[FirebaseService] No user logged in');
        return null;
      }

      // If groupId is provided, check that specific group first
      if (groupId) {
        try {
          const groupTodoRef = ref(database, `groups/${groupId}/todos/${todoId}`);
          const snapshot = await get(groupTodoRef);
          if (snapshot.exists()) {
            console.info('[FirebaseService] Found todo at /groups/{groupId}/todos/');
            return this.deserializeTodo(snapshot.val());
          }
        } catch (groupError) {
          console.warn('[FirebaseService] Could not check specific group todos:', groupError);
        }
      }

      // Try personal todos under user
      try {
        const personalTodoRef = ref(database, `users/${currentUser.uid}/personal-todos/${todoId}`);
        const personalSnapshot = await get(personalTodoRef);
        if (personalSnapshot.exists()) {
          console.info('[FirebaseService] Found todo at /users/{uid}/personal-todos/');
          return this.deserializeTodo(personalSnapshot.val());
        }
      } catch (personalError) {
        console.warn('[FirebaseService] Could not check personal todos:', personalError);
      }

      // If not found yet and no specific groupId was provided, check ALL user's groups
      if (!groupId) {
        try {
          const groups = await this.getGroups(currentUser.uid);
          console.info(`[FirebaseService] Searching ${groups.length} groups for todo`);

          for (const group of groups) {
            try {
              const groupTodoRef = ref(database, `groups/${group.id}/todos/${todoId}`);
              const snapshot = await get(groupTodoRef);
              if (snapshot.exists()) {
                console.info(
                  `[FirebaseService] Found todo at /groups/${group.id}/todos/ (${group.name})`
                );
                return this.deserializeTodo(snapshot.val());
              }
            } catch (groupError) {
              // Continue to next group
            }
          }
        } catch (groupsError) {
          console.warn('[FirebaseService] Could not search user groups:', groupsError);
        }
      }

      // Try root todos as last resort (may have permission issues)
      try {
        const rootTodoRef = ref(database, `todos/${todoId}`);
        const rootSnapshot = await get(rootTodoRef);
        if (rootSnapshot.exists()) {
          console.info('[FirebaseService] Found todo at /todos/');
          return this.deserializeTodo(rootSnapshot.val());
        }
      } catch (rootError) {
        console.warn(
          '[FirebaseService] Could not check root todos (permission or not found):',
          rootError
        );
      }

      console.warn('[FirebaseService] Todo not found in any location:', todoId);
      return null;
    } catch (error: any) {
      console.error('[FirebaseService] Error getting todo:', error);
      throw new DataServiceError('Failed to get todo', error.code, error);
    }
  }

  async getTodosForUser(userId: string): Promise<Todo[]> {
    try {
      console.info('[FirebaseService] Getting todos for user:', userId);

      const allTodos: Todo[] = [];

      // 1. Get personal todos from /users/{userId}/personal-todos
      const personalTodosRef = ref(database, `users/${userId}/personal-todos`);
      const personalSnapshot = await get(personalTodosRef);

      if (personalSnapshot.exists()) {
        personalSnapshot.forEach((childSnapshot) => {
          allTodos.push(this.deserializeTodo(childSnapshot.val()));
        });
      }

      // 2. Get group todos from each group the user belongs to
      const groups = await this.getGroups(userId);
      const groupIds = groups.map((g) => g.id);
      console.info('[FirebaseService] User group IDs:', groupIds);

      for (const groupId of groupIds) {
        const groupTodosRef = ref(database, `groups/${groupId}/todos`);
        const snapshot = await get(groupTodosRef);

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            allTodos.push(this.deserializeTodo(childSnapshot.val()));
          });
        }
      }

      console.info('[FirebaseService] Total todos for user:', allTodos.length);
      return allTodos;
    } catch (error: any) {
      console.error('[FirebaseService] Error getting todos for user:', error);
      throw new DataServiceError('Failed to get todos for user', error.code, error);
    }
  }

  async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    try {
      let todosRef;

      // If todo has no groupId, it's a personal todo - store under user
      if (!todo.groupId) {
        todosRef = ref(database, `users/${todo.createdBy}/personal-todos`);
      } else {
        // Group todo - store under the group
        todosRef = ref(database, `groups/${todo.groupId}/todos`);
      }

      const newTodoRef = push(todosRef);

      const newTodo: Todo = {
        ...todo,
        id: newTodoRef.key!,
      };

      await set(newTodoRef, this.serializeTodo(newTodo));
      return newTodo;
    } catch (error: any) {
      throw new DataServiceError('Failed to create todo', error.code, error);
    }
  }

  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
    try {
      // We need to find where the todo is stored
      // First try to get the todo to find its location
      const todo = updates.groupId
        ? await this.getTodoById(todoId, updates.groupId)
        : await this.getTodoById(todoId);

      if (!todo) {
        throw new DataServiceError('Todo not found');
      }

      // Determine the correct reference based on where the todo is stored
      let todoRef;
      if (todo.groupId) {
        // Group todo
        todoRef = ref(database, `groups/${todo.groupId}/todos/${todoId}`);
      } else {
        // Personal todo - stored under user
        todoRef = ref(database, `users/${todo.createdBy}/personal-todos/${todoId}`);
      }

      await update(todoRef, this.serializeTodo(updates as any));
    } catch (error: any) {
      console.error('[FirebaseService] Error updating todo:', error);
      throw new DataServiceError('Failed to update todo', error.code, error);
    }
  }

  async deleteTodo(todoId: string, groupId?: string): Promise<void> {
    try {
      const todoRef = groupId
        ? ref(database, `groups/${groupId}/todos/${todoId}`)
        : ref(database, `todos/${todoId}`);

      await remove(todoRef);
    } catch (error: any) {
      throw new DataServiceError('Failed to delete todo', error.code, error);
    }
  }

  async toggleTodoComplete(todoId: string, groupId?: string): Promise<void> {
    try {
      console.info('[FirebaseService] Toggling todo:', todoId, 'groupId:', groupId);

      const todo = await this.getTodoById(todoId, groupId);

      if (!todo) {
        console.error('[FirebaseService] Todo not found:', todoId);
        throw new DataServiceError('Todo not found');
      }

      console.info('[FirebaseService] Found todo:', todo);

      const updates: Partial<Todo> = {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : undefined,
      };

      // Determine the correct reference based on where the todo is stored
      let todoRef;

      // Try to locate the todo in this priority order:
      // 1. Group todos (if groupId present)
      // 2. Personal todos (under user)
      // 3. Root todos (fallback)

      if (todo.groupId) {
        console.info('[FirebaseService] Updating todo at /groups/{groupId}/todos/');
        todoRef = ref(database, `groups/${todo.groupId}/todos/${todoId}`);
      } else {
        // Personal todo at /users/{userId}/personal-todos/
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.info('[FirebaseService] Updating todo at /users/{uid}/personal-todos/');
          todoRef = ref(database, `users/${currentUser.uid}/personal-todos/${todoId}`);
        } else {
          // Fallback to root (should rarely happen)
          console.warn('[FirebaseService] No user logged in, trying /todos/');
          todoRef = ref(database, `todos/${todoId}`);
        }
      }

      console.info('[FirebaseService] Updating todo at path:', todoRef.toString());
      await update(todoRef, this.serializeTodo(updates as any));
      console.info('[FirebaseService] Todo toggled successfully');
    } catch (error: any) {
      console.error('[FirebaseService] Error toggling todo:', error);
      throw new DataServiceError('Failed to toggle todo', error.code, error);
    }
  }

  /**
   * Clean up old completed todos (older than 3 days)
   * This helps reduce database size and improve performance
   */
  async cleanupCompletedTodos(userId: string): Promise<number> {
    try {
      console.info('[FirebaseService] Starting cleanup of completed todos for user:', userId);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoTime = threeDaysAgo.getTime();

      let deletedCount = 0;

      // Get all todos for the user
      const todos = await this.getTodosForUser(userId);

      // Filter completed todos older than 3 days
      const todosToDelete = todos.filter((todo) => {
        if (!todo.completed || !todo.completedAt) return false;
        const completedAt = new Date(todo.completedAt);
        return completedAt.getTime() < threeDaysAgoTime;
      });

      console.info(
        `[FirebaseService] Found ${todosToDelete.length} completed todos older than 3 days`
      );

      // Delete each old completed todo
      for (const todo of todosToDelete) {
        try {
          await this.deleteTodo(todo.id, todo.groupId);
          deletedCount++;
          console.info(`[FirebaseService] Deleted old completed todo: ${todo.id}`);
        } catch (error) {
          console.error(`[FirebaseService] Failed to delete todo ${todo.id}:`, error);
        }
      }

      console.info(`[FirebaseService] Cleanup complete. Deleted ${deletedCount} todos`);
      return deletedCount;
    } catch (error: any) {
      console.error('[FirebaseService] Error during todo cleanup:', error);
      throw new DataServiceError('Failed to cleanup completed todos', error.code, error);
    }
  }

  // ==================== INVITATIONS ====================

  async createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation> {
    try {
      const group = await this.getGroupById(groupId);

      if (!group) {
        throw new DataServiceError('Group not found');
      }

      const invitationsRef = ref(database, 'invitations');
      const newInvitationRef = push(invitationsRef);

      const invitation: Invitation = {
        id: newInvitationRef.key!,
        groupId,
        groupName: group.name,
        invitedBy,
        invitedEmail: email,
        status: 'pending',
        createdAt: new Date(),
      };

      await set(newInvitationRef, this.serializeInvitation(invitation));
      return invitation;
    } catch (error: any) {
      throw new DataServiceError('Failed to create invitation', error.code, error);
    }
  }

  async getInvitationsForUser(email: string): Promise<Invitation[]> {
    try {
      const invitationsRef = ref(database, 'invitations');
      const snapshot = await get(invitationsRef);

      if (!snapshot.exists()) return [];

      const invitations: Invitation[] = [];
      snapshot.forEach((childSnapshot) => {
        const invitation = this.deserializeInvitation(childSnapshot.val());
        if (invitation.invitedEmail === email && invitation.status === 'pending') {
          invitations.push(invitation);
        }
      });

      return invitations;
    } catch (error: any) {
      throw new DataServiceError('Failed to get invitations', error.code, error);
    }
  }

  async respondToInvitation(invitationId: string, accepted: boolean): Promise<void> {
    try {
      const invitationRef = ref(database, `invitations/${invitationId}`);
      const snapshot = await get(invitationRef);

      if (!snapshot.exists()) {
        throw new DataServiceError('Invitation not found');
      }

      const invitation = this.deserializeInvitation(snapshot.val());

      await update(invitationRef, {
        status: accepted ? 'accepted' : 'declined',
      });

      if (accepted) {
        // Add user to group (this requires knowing the user ID from email)
        // In production, this would be handled differently
      }
    } catch (error: any) {
      throw new DataServiceError('Failed to respond to invitation', error.code, error);
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  subscribeToGroups(userId: string, callback: (groups: Group[]) => void): () => void {
    const userGroupsRef = ref(database, `user-groups/${userId}`);

    const unsubscribe = onValue(userGroupsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const groupIds = Object.keys(snapshot.val());
      const groupPromises = groupIds.map((groupId) => this.getGroupById(groupId));
      const groups = (await Promise.all(groupPromises)).filter((g): g is Group => g !== null);

      callback(groups);
    });

    return unsubscribe;
  }

  subscribeToEvents(groupId: string, callback: (events: Event[]) => void): () => void {
    const eventsRef = ref(database, 'events');

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const events: Event[] = [];
      snapshot.forEach((childSnapshot) => {
        const event = this.deserializeEvent(childSnapshot.val());
        if (!groupId || event.groupId === groupId) {
          events.push(event);
        }
      });

      callback(events);
    });

    return unsubscribe;
  }

  subscribeToTodos(groupId: string, callback: (todos: Todo[]) => void): () => void {
    const todosRef = ref(database, 'todos');

    const unsubscribe = onValue(todosRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const todos: Todo[] = [];
      snapshot.forEach((childSnapshot) => {
        const todo = this.deserializeTodo(childSnapshot.val());
        if (!groupId || todo.groupId === groupId) {
          todos.push(todo);
        }
      });

      callback(todos);
    });

    return unsubscribe;
  }

  // ==================== HELPER METHODS ====================

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(firebaseUser.metadata.creationTime!),
    };
  }

  private generateRandomCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Serialization helpers (convert Date to ISO string for Firebase)
  private serializeGroup(group: Partial<Group>): any {
    const serialized: any = {
      ...group,
      createdAt: group.createdAt?.toISOString(),
    };

    // Only add inviteCodeCreatedAt if it exists
    if (group.inviteCodeCreatedAt) {
      serialized.inviteCodeCreatedAt = group.inviteCodeCreatedAt.toISOString();
    }

    // Remove any undefined values
    Object.keys(serialized).forEach((key) => {
      if (serialized[key] === undefined) {
        delete serialized[key];
      }
    });

    return serialized;
  }

  private deserializeGroup(data: any): Group {
    return {
      ...data,
      members: data.members || {},
      createdAt: new Date(data.createdAt),
      inviteCodeCreatedAt: data.inviteCodeCreatedAt
        ? new Date(data.inviteCodeCreatedAt)
        : undefined,
    };
  }

  private serializeEvent(event: Partial<Event>): any {
    const serialized: any = {};

    // Only add defined properties to avoid Firebase undefined error
    Object.keys(event).forEach((key) => {
      const value = (event as any)[key];
      if (value !== undefined) {
        serialized[key] = value;
      }
    });

    // Convert Date objects to ISO strings
    if (event.startDate) {
      serialized.startDate = event.startDate.toISOString();
    }
    if (event.endDate) {
      serialized.endDate = event.endDate.toISOString();
    }

    return serialized;
  }

  private deserializeEvent(data: any): Event {
    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
  }

  private serializeTodo(todo: Partial<Todo>): any {
    const serialized: any = {};

    // Only add defined properties to avoid Firebase undefined error
    Object.keys(todo).forEach((key) => {
      const value = (todo as any)[key];
      if (value !== undefined) {
        serialized[key] = value;
      }
    });

    // Convert Date objects to ISO strings
    if (todo.dueDate) {
      serialized.dueDate = todo.dueDate.toISOString();
    }
    if (todo.createdAt) {
      serialized.createdAt = todo.createdAt.toISOString();
    }
    if (todo.completedAt) {
      serialized.completedAt = todo.completedAt.toISOString();
    }

    return serialized;
  }

  private deserializeTodo(data: any): Todo {
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  }

  private serializeUser(user: Partial<User>): any {
    const serialized = {
      ...user,
      createdAt: user.createdAt?.toISOString(),
    };
    // Remove undefined values to prevent Firebase errors
    return Object.fromEntries(
      Object.entries(serialized).filter(([_, value]) => value !== undefined)
    );
  }

  private deserializeUser(data: any): User {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
    };
  }

  private serializeInvitation(invitation: Partial<Invitation>): any {
    return {
      ...invitation,
      createdAt: invitation.createdAt?.toISOString(),
      expiresAt: invitation.expiresAt?.toISOString(),
    };
  }

  private deserializeInvitation(data: any): Invitation {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    };
  }
}

export const firebaseService = new FirebaseService();
