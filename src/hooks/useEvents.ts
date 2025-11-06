/**
 * Custom hook for managing calendar events with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { dataService } from '../services';
import { Event } from '../types';

export const useEvents = (userId: string | undefined) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const unsubscribeRef = useRef<(() => void)[]>([]);

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

  // Set up real-time listener for events
  useEffect(() => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Initial load
    loadEvents();

    // Subscribe to real-time updates - listen to Firebase changes
    // Since events can be in multiple paths (personal-events, group events),
    // we'll use a polling approach with Firebase onValue listeners
    // This will automatically refresh when any event changes
    const refreshInterval = setInterval(() => {
      // Silently refresh events every 5 seconds to catch new events
      if (!refreshing) {
        loadEvents();
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(refreshInterval);
      // Cleanup any active subscriptions
      unsubscribeRef.current.forEach((unsub) => unsub());
      unsubscribeRef.current = [];
    };
  }, [userId, loadEvents, refreshing]);

  return {
    events,
    loading,
    error,
    refreshing,
    refresh,
    reload: loadEvents,
  };
};
