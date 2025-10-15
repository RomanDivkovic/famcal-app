/**
 * Data Service Interface
 * This interface defines all data operations for the app.
 * Both Firebase and custom .NET backend implementations must follow this interface.
 */

import { User, Group, Event, Todo, Invitation } from '../types';

export interface IDataService {
  // Authentication
  signUp(email: string, password: string, displayName?: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<void>;

  // Groups
  getGroups(userId: string): Promise<Group[]>;
  getGroupById(groupId: string): Promise<Group | null>;
  createGroup(name: string, description: string, userId: string): Promise<Group>;
  updateGroup(groupId: string, updates: Partial<Group>): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  joinGroup(groupId: string, userId: string, inviteCode?: string): Promise<void>;
  leaveGroup(groupId: string, userId: string): Promise<void>;
  generateInviteCode(groupId: string): Promise<string>;

  // Events
  getEvents(groupId?: string): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | null>;
  getEventsForUser(userId: string): Promise<Event[]>;
  getEventsInDateRange(startDate: Date, endDate: Date, userId: string): Promise<Event[]>;
  createEvent(event: Omit<Event, 'id'>): Promise<Event>;
  updateEvent(eventId: string, updates: Partial<Event>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;

  // Todos
  getTodos(groupId?: string): Promise<Todo[]>;
  getTodoById(todoId: string): Promise<Todo | null>;
  getTodosForUser(userId: string): Promise<Todo[]>;
  createTodo(todo: Omit<Todo, 'id'>): Promise<Todo>;
  updateTodo(todoId: string, updates: Partial<Todo>): Promise<void>;
  deleteTodo(todoId: string): Promise<void>;
  toggleTodoComplete(todoId: string): Promise<void>;

  // Invitations
  createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation>;
  getInvitationsForUser(email: string): Promise<Invitation[]>;
  respondToInvitation(invitationId: string, accepted: boolean): Promise<void>;

  // Real-time listeners (for Firebase)
  subscribeToGroups?(userId: string, callback: (groups: Group[]) => void): () => void;
  subscribeToEvents?(groupId: string, callback: (events: Event[]) => void): () => void;
  subscribeToTodos?(groupId: string, callback: (todos: Todo[]) => void): () => void;
}

export class DataServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DataServiceError';
  }
}
