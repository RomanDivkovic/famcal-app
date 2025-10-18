/**
 * REST API Service Implementation
 * Implements IDataService using a custom .NET backend
 */

import { IDataService, DataServiceError } from './IDataService';
import { User, Group, Event, Todo, Invitation } from '../types';

// Base URL from environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-dotnet-api.com/api';

/**
 * Custom .NET API implementation of the data service
 * Makes REST calls to a backend API
 */
class ApiService implements IDataService {
  private authToken: string | null = null;

  // ==================== HTTP HELPERS ====================

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Merge with provided headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new DataServiceError(
          error.message || 'Request failed',
          `HTTP_${response.status}`,
          error
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error: any) {
      if (error instanceof DataServiceError) {
        throw error;
      }
      throw new DataServiceError('Network request failed', 'NETWORK_ERROR', error);
    }
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== AUTHENTICATION ====================

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const response = await this.post<{ user: User; token: string }>('/auth/signup', {
      email,
      password,
      displayName,
    });

    this.authToken = response.token;
    return response.user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const response = await this.post<{ user: User; token: string }>('/auth/signin', {
      email,
      password,
    });

    this.authToken = response.token;
    return response.user;
  }

  async signInWithGoogle(): Promise<User> {
    // Implement Google OAuth flow with your backend
    throw new DataServiceError('Google sign-in not implemented for API service');
  }

  async signOut(): Promise<void> {
    await this.post('/auth/signout');
    this.authToken = null;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.get<User>('/auth/me');
    } catch (error: any) {
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.get<User>(`/users/${userId}`);
    } catch (error: any) {
      if (error.code === 'HTTP_404') return null;
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    await this.patch(`/users/${userId}`, updates);
  }

  async deleteAccount(password: string): Promise<void> {
    await this.post('/auth/delete-account', { password });
    this.authToken = null;
  }

  // ==================== GROUPS ====================

  async getGroups(userId: string): Promise<Group[]> {
    return this.get<Group[]>(`/users/${userId}/groups`);
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    try {
      return await this.get<Group>(`/groups/${groupId}`);
    } catch (error: any) {
      if (error.code === 'HTTP_404') return null;
      throw error;
    }
  }

  async findGroupByInviteCode(inviteCode: string): Promise<Group | null> {
    try {
      return await this.get<Group>(`/groups/by-invite/${inviteCode}`);
    } catch (error: any) {
      if (error.code === 'HTTP_404') return null;
      throw error;
    }
  }

  async createGroup(name: string, description: string, userId: string): Promise<Group> {
    return this.post<Group>('/groups', { name, description, userId });
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    await this.patch(`/groups/${groupId}`, updates);
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.delete(`/groups/${groupId}`);
  }

  async joinGroup(groupId: string, userId: string, inviteCode?: string): Promise<void> {
    await this.post(`/groups/${groupId}/join`, { userId, inviteCode });
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await this.post(`/groups/${groupId}/leave`, { userId });
  }

  async generateInviteCode(groupId: string): Promise<string> {
    const response = await this.post<{ inviteCode: string }>(`/groups/${groupId}/invite-code`);
    return response.inviteCode;
  }

  // ==================== EVENTS ====================

  async getEvents(groupId?: string): Promise<Event[]> {
    const endpoint = groupId ? `/groups/${groupId}/events` : '/events';
    return this.get<Event[]>(endpoint);
  }

  async getEventById(eventId: string): Promise<Event | null> {
    try {
      return await this.get<Event>(`/events/${eventId}`);
    } catch (error: any) {
      if (error.code === 'HTTP_404') return null;
      throw error;
    }
  }

  async getEventsForUser(userId: string): Promise<Event[]> {
    return this.get<Event[]>(`/users/${userId}/events`);
  }

  async getEventsInDateRange(startDate: Date, endDate: Date, userId: string): Promise<Event[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return this.get<Event[]>(`/users/${userId}/events?${params}`);
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    return this.post<Event>('/events', event);
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    await this.patch(`/events/${eventId}`, updates);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.delete(`/events/${eventId}`);
  }

  // ==================== TODOS ====================

  async getTodos(groupId?: string): Promise<Todo[]> {
    const endpoint = groupId ? `/groups/${groupId}/todos` : '/todos';
    return this.get<Todo[]>(endpoint);
  }

  async getTodoById(todoId: string): Promise<Todo | null> {
    try {
      return await this.get<Todo>(`/todos/${todoId}`);
    } catch (error: any) {
      if (error.code === 'HTTP_404') return null;
      throw error;
    }
  }

  async getTodosForUser(userId: string): Promise<Todo[]> {
    return this.get<Todo[]>(`/users/${userId}/todos`);
  }

  async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    return this.post<Todo>('/todos', todo);
  }

  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
    await this.patch(`/todos/${todoId}`, updates);
  }

  async deleteTodo(todoId: string): Promise<void> {
    await this.delete(`/todos/${todoId}`);
  }

  async toggleTodoComplete(todoId: string): Promise<void> {
    await this.post(`/todos/${todoId}/toggle`);
  }

  // ==================== INVITATIONS ====================

  async createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation> {
    return this.post<Invitation>('/invitations', { groupId, email, invitedBy });
  }

  async getInvitationsForUser(email: string): Promise<Invitation[]> {
    return this.get<Invitation[]>(`/invitations?email=${encodeURIComponent(email)}`);
  }

  async respondToInvitation(invitationId: string, accepted: boolean): Promise<void> {
    await this.post(`/invitations/${invitationId}/respond`, { accepted });
  }

  // Note: Real-time listeners are not supported with REST API
  // You would need to implement polling or use WebSockets/SignalR for real-time updates
}

export const apiService = new ApiService();
