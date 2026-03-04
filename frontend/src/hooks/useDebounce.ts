import { useEffect, useState } from "react";

/**
 * Hook - useDebounce
 * handle debounce technique with generic type support
 * 
 * @param value search keyword
 * @param delay delay time
 * @returns it return reusable logic for debounce technique
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}