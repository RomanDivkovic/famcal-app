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
import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
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

      // Store user data in database
      // Remove undefined values to prevent Firebase errors
      const userDataForDb = Object.fromEntries(
        Object.entries(user).filter(([_, value]) => value !== undefined)
      );
      await set(ref(database, `users/${user.id}`), userDataForDb);

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
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) return null;

      return this.deserializeUser(snapshot.val());
    } catch (error: any) {
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
          if (group.members && group.members.includes(userId)) {
            const newMembers = group.members.filter((id: string) => id !== userId);
            updates[`groups/${childSnapshot.key}/members`] = newMembers;
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
      const groupsRef = ref(database, 'groups');
      const snapshot = await get(groupsRef);

      if (!snapshot.exists()) return [];

      const groups: Group[] = [];
      snapshot.forEach((childSnapshot) => {
        const group = this.deserializeGroup(childSnapshot.val());
        if (group.members.includes(userId)) {
          groups.push(group);
        }
      });

      return groups;
    } catch (error: any) {
      throw new DataServiceError('Failed to get groups', error.code, error);
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
      const groupsRef = ref(database, 'groups');
      const inviteQuery = query(groupsRef, orderByChild('inviteCode'), equalTo(inviteCode));
      const snapshot = await get(inviteQuery);

      if (!snapshot.exists()) return null;

      // Get the first matching group (should only be one)
      let foundGroup: Group | null = null;
      snapshot.forEach((childSnapshot) => {
        if (!foundGroup) {
          foundGroup = this.deserializeGroup(childSnapshot.val());
        }
      });

      return foundGroup;
    } catch (error: any) {
      throw new DataServiceError('Failed to find group by invite code', error.code, error);
    }
  }

  async createGroup(name: string, description: string, userId: string): Promise<Group> {
    try {
      const groupsRef = ref(database, 'groups');
      const newGroupRef = push(groupsRef);

      const group: Group = {
        id: newGroupRef.key!,
        name,
        description,
        members: [userId],
        createdBy: userId,
        createdAt: new Date(),
        inviteCode: this.generateRandomCode(),
      };

      await set(newGroupRef, this.serializeGroup(group));
      return group;
    } catch (error: any) {
      throw new DataServiceError('Failed to create group', error.code, error);
    }
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    try {
      const groupRef = ref(database, `groups/${groupId}`);
      await update(groupRef, updates);
    } catch (error: any) {
      throw new DataServiceError('Failed to update group', error.code, error);
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

      if (inviteCode && group.inviteCode !== inviteCode) {
        throw new DataServiceError('Invalid invite code');
      }

      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await this.updateGroup(groupId, { members: group.members });
      }
    } catch (error: any) {
      throw new DataServiceError('Failed to join group', error.code, error);
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await this.getGroupById(groupId);

      if (!group) {
        throw new DataServiceError('Group not found');
      }

      const updatedMembers = group.members.filter((id) => id !== userId);

      // If no members left, delete the group
      if (updatedMembers.length === 0) {
        await this.deleteGroup(groupId);
      } else {
        await this.updateGroup(groupId, { members: updatedMembers });
      }
    } catch (error: any) {
      throw new DataServiceError('Failed to leave group', error.code, error);
    }
  }

  async generateInviteCode(groupId: string): Promise<string> {
    try {
      const code = this.generateRandomCode();
      await this.updateGroup(groupId, { inviteCode: code });
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
      const eventRef = ref(database, `events/${eventId}`);
      const snapshot = await get(eventRef);

      if (!snapshot.exists()) return null;

      return this.deserializeEvent(snapshot.val());
    } catch (error: any) {
      throw new DataServiceError('Failed to get event', error.code, error);
    }
  }

  async getEventsForUser(userId: string): Promise<Event[]> {
    try {
      // Get user's groups
      const groups = await this.getGroups(userId);
      const groupIds = groups.map((g) => g.id);

      // Get all events
      const allEvents = await this.getEvents();

      // Filter events that belong to user's groups or are personal
      return allEvents.filter((event) => !event.groupId || groupIds.includes(event.groupId));
    } catch (error: any) {
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

      const eventsRef = ref(database, 'events');
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

      await set(newEventRef, serialized);
      console.info('[FirebaseService] Event saved successfully with ID:', newEvent.id);

      return newEvent;
    } catch (error: any) {
      console.error('[FirebaseService] Error creating event:', error);
      throw new DataServiceError(
        `Failed to create event: ${error.message || 'Unknown error'}`,
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
      const todosRef = ref(database, 'todos');
      const snapshot = await get(todosRef);

      if (!snapshot.exists()) return [];

      const todos: Todo[] = [];
      snapshot.forEach((childSnapshot) => {
        const todo = this.deserializeTodo(childSnapshot.val());
        if (!groupId || todo.groupId === groupId) {
          todos.push(todo);
        }
      });

      return todos;
    } catch (error: any) {
      throw new DataServiceError('Failed to get todos', error.code, error);
    }
  }

  async getTodoById(todoId: string): Promise<Todo | null> {
    try {
      const todoRef = ref(database, `todos/${todoId}`);
      const snapshot = await get(todoRef);

      if (!snapshot.exists()) return null;

      return this.deserializeTodo(snapshot.val());
    } catch (error: any) {
      throw new DataServiceError('Failed to get todo', error.code, error);
    }
  }

  async getTodosForUser(userId: string): Promise<Todo[]> {
    try {
      const groups = await this.getGroups(userId);
      const groupIds = groups.map((g) => g.id);

      const allTodos = await this.getTodos();

      return allTodos.filter((todo) => !todo.groupId || groupIds.includes(todo.groupId));
    } catch (error: any) {
      throw new DataServiceError('Failed to get todos for user', error.code, error);
    }
  }

  async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    try {
      const todosRef = ref(database, 'todos');
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
      const todoRef = ref(database, `todos/${todoId}`);
      await update(todoRef, this.serializeTodo(updates as any));
    } catch (error: any) {
      throw new DataServiceError('Failed to update todo', error.code, error);
    }
  }

  async deleteTodo(todoId: string): Promise<void> {
    try {
      const todoRef = ref(database, `todos/${todoId}`);
      await remove(todoRef);
    } catch (error: any) {
      throw new DataServiceError('Failed to delete todo', error.code, error);
    }
  }

  async toggleTodoComplete(todoId: string): Promise<void> {
    try {
      const todo = await this.getTodoById(todoId);

      if (!todo) {
        throw new DataServiceError('Todo not found');
      }

      const updates: Partial<Todo> = {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : undefined,
      };

      await this.updateTodo(todoId, updates);
    } catch (error: any) {
      throw new DataServiceError('Failed to toggle todo', error.code, error);
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
    const groupsRef = ref(database, 'groups');

    const unsubscribe = onValue(groupsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const groups: Group[] = [];
      snapshot.forEach((childSnapshot) => {
        const group = this.deserializeGroup(childSnapshot.val());
        if (group.members.includes(userId)) {
          groups.push(group);
        }
      });

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
    return {
      ...group,
      createdAt: group.createdAt?.toISOString(),
    };
  }

  private deserializeGroup(data: any): Group {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
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
    return {
      ...user,
      createdAt: user.createdAt?.toISOString(),
    };
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
