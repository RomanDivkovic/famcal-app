/**
 * Custom hooks for the app
 */

import { useState, useEffect } from 'react';
import { dataService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Group, Event, Todo } from '../types';

/**
 * Hook to fetch and manage groups
 */
export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadGroups = async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userGroups = await dataService.getGroups(user.id);
      setGroups(userGroups);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  return { groups, loading, error, refresh: loadGroups };
};

/**
 * Hook to fetch and manage events
 */
export const useEvents = (groupId?: string) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userEvents = groupId
        ? await dataService.getEvents(groupId)
        : await dataService.getEventsForUser(user.id);
      setEvents(userEvents);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user, groupId]);

  return { events, loading, error, refresh: loadEvents };
};

/**
 * Hook to fetch and manage todos
 */
export const useTodos = (groupId?: string) => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodos = async () => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userTodos = groupId
        ? await dataService.getTodos(groupId)
        : await dataService.getTodosForUser(user.id);
      setTodos(userTodos);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [user, groupId]);

  return { todos, loading, error, refresh: loadTodos };
};
