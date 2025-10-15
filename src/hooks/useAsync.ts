/**
 * Custom hook for async operations (loading, error handling)
 */

import { useState, useCallback } from 'react';

interface UseAsyncOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAsync = <T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: UseAsyncOptions
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
};
