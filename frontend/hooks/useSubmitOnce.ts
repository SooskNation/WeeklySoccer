import { useRef, useCallback } from 'react';

export function useSubmitOnce<T extends (...args: any[]) => Promise<any>>(
  fn: T
): [T, () => void] {
  const pendingRef = useRef(false);

  const wrappedFn = useCallback(
    async (...args: Parameters<T>) => {
      if (pendingRef.current) {
        return;
      }

      pendingRef.current = true;
      try {
        return await fn(...args);
      } finally {
        pendingRef.current = false;
      }
    },
    [fn]
  ) as T;

  const reset = useCallback(() => {
    pendingRef.current = false;
  }, []);

  return [wrappedFn, reset];
}
