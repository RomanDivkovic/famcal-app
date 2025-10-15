/**
 * Custom hook for managing groups
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services';
import { Group } from '../types';

export const useGroups = (userId: string | undefined) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const userGroups = await dataService.getGroups(userId);
      setGroups(userGroups);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load groups');
      setError(error);
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return {
    groups,
    loading,
    error,
    refreshing,
    refresh,
    reload: loadGroups,
  };
};
