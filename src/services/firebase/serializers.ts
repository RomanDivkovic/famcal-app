/**
 * Serialization/Deserialization Helpers
 * Convert between app types and Firebase-compatible formats
 */

import { User, Group, Event, Todo, Invitation } from '../../types';

// ==================== GROUP ====================

export function serializeGroup(group: Partial<Group>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {
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

export function deserializeGroup(data: Record<string, unknown>): Group {
  return {
    ...data,
    members: (data.members as Record<string, boolean>) || {},
    createdAt: new Date(data.createdAt as string),
    inviteCodeCreatedAt: data.inviteCodeCreatedAt
      ? new Date(data.inviteCodeCreatedAt as string)
      : undefined,
  } as Group;
}

// ==================== EVENT ====================

export function serializeEvent(event: Partial<Event>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  // Only add defined properties to avoid Firebase undefined error
  Object.keys(event).forEach((key) => {
    const value = event[key as keyof Event];
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

export function deserializeEvent(data: Record<string, unknown>): Event {
  return {
    ...data,
    startDate: new Date(data.startDate as string),
    endDate: new Date(data.endDate as string),
  } as Event;
}

// ==================== TODO ====================

export function serializeTodo(todo: Partial<Todo>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  // Only add defined properties to avoid Firebase undefined error
  Object.keys(todo).forEach((key) => {
    const value = todo[key as keyof Todo];
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

export function deserializeTodo(data: Record<string, unknown>): Todo {
  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
    createdAt: new Date(data.createdAt as string),
    completedAt: data.completedAt ? new Date(data.completedAt as string) : undefined,
  } as Todo;
}

// ==================== USER ====================

export function serializeUser(user: Partial<User>): Record<string, unknown> {
  const serialized = {
    ...user,
    createdAt: user.createdAt?.toISOString(),
  };
  // Remove undefined values to prevent Firebase errors
  return Object.fromEntries(Object.entries(serialized).filter(([, value]) => value !== undefined));
}

export function deserializeUser(data: Record<string, unknown>): User {
  return {
    ...data,
    createdAt: new Date(data.createdAt as string),
  } as User;
}

// ==================== INVITATION ====================

export function serializeInvitation(invitation: Partial<Invitation>): Record<string, unknown> {
  return {
    ...invitation,
    createdAt: invitation.createdAt?.toISOString(),
    expiresAt: invitation.expiresAt?.toISOString(),
  };
}

export function deserializeInvitation(data: Record<string, unknown>): Invitation {
  return {
    ...data,
    createdAt: new Date(data.createdAt as string),
    expiresAt: data.expiresAt ? new Date(data.expiresAt as string) : undefined,
  } as Invitation;
}

// ==================== UTILITY ====================

export function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
