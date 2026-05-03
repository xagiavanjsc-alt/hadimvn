import { useState, useCallback } from "react";
import { logError } from "@/utils/errorHandler";

/**
 * Type-safe localStorage hook with validation and error handling
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist or is invalid
 * @param validator - Optional function to validate stored data
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => value is T
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item) as unknown;
      
      // Validate if validator provided
      if (validator && !validator(parsed)) {
        logError(new Error(`Invalid localStorage data for key "${key}"`), { key, value: parsed });
        return initialValue;
      }
      
      return parsed as T;
    } catch (error) {
      logError(error, { key });
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
          
          // Validate before storing
          if (validator && !validator(next)) {
            logError(new Error(`Invalid value for localStorage key "${key}"`), { key, value: next });
            return prev;
          }
          
          window.localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      } catch (error) {
        logError(error, { key });
      }
    },
    [key, validator]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      logError(error, { key });
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
