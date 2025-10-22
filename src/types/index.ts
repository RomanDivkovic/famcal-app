/**
 * Core TypeScript interfaces for the GroupCalendar app
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: { [userId: string]: boolean }; // Object of user IDs to true
  createdBy: string; // User ID
  createdAt: Date;
  color?: string; // Color for visual identification
  inviteCode?: string; // Code for joining the group
  inviteCodeCreatedAt?: Date; // Timestamp when invite code was created
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  groupId?: string; // If undefined, it's a personal event
  createdBy: string; // User ID
  color?: string; // Inherited from group or custom
  location?: string;
  allDay?: boolean;
  reminders?: number[]; // Minutes before event
  recurrence?: RecurrenceRule;
  syncedToNativeCalendar?: boolean;
  nativeCalendarEventId?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: Date;
  count?: number;
}

export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  dueDate?: Date;
  groupId?: string; // If undefined, it's a personal todo
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
  linkedEventId?: string; // Optional link to calendar event
}

export interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string; // User ID
  invitedByName?: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt?: Date;
}

export interface CalendarPermissions {
  granted: boolean;
  canReadCalendar: boolean;
  canWriteCalendar: boolean;
}

export interface ThemeMode {
  mode: 'light' | 'dark';
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark';
  defaultCalendarView: 'day' | 'week' | 'month';
  notificationsEnabled: boolean;
  syncToNativeCalendar: boolean;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CreateGroup: undefined;
  GroupDetail: { groupId: string };
  CreateEvent: { groupId?: string; date?: Date };
  EventDetail: { eventId: string };
  CreateTodo: { groupId?: string };
  FAQ: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Todos: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  GroupList: undefined;
  CreateGroup: undefined;
  GroupDetail: { groupId: string };
  InviteMembers: { groupId: string };
};

export type CalendarStackParamList = {
  CalendarView: undefined;
  EventDetail: { eventId: string };
  CreateEvent: { groupId?: string; date?: Date };
};

export type TodoStackParamList = {
  TodoList: undefined;
  TodoDetail: { todoId: string };
  CreateTodo: { groupId?: string };
};
