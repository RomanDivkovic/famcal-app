/**
 * Custom hook for managing calendar events
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services';
import { Event } from '../types';

export const useEvents = (userId: string | undefined) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const userEvents = await dataService.getEventsForUser(userId);
      setEvents(userEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load events');
      setError(error);
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    loading,
    error,
    refreshing,
    refresh,
    reload: loadEvents,
  };
};
