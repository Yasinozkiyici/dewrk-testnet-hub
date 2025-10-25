'use client';

import { useCallback, type KeyboardEvent } from 'react';

/**
 * Returns a keyboard handler that triggers the provided callback on Enter or Space.
 */
export function useActivateOnEnter<T extends HTMLElement>(callback: () => void) {
  return useCallback(
    (event: KeyboardEvent<T>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
      }
    },
    [callback]
  );
}
