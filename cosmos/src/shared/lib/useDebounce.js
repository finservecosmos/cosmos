import { useState, useEffect } from 'react';

/**
 * Custom React hook to debounce state updates.
 * @param {*} value The value to debounce.
 * @param {number} delay Timeout delay in milliseconds (default: 300ms).
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
