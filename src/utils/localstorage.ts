// ABOUTME: Persists React state in local storage without breaking server rendering.
// ABOUTME: Synchronizes updates across hooks in the current tab and other browser tabs.

import React from "react";

const StickyStateEvent = "sticky-state-change";

export function getLocalStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const item = localStorage.getItem(key);

  if (!item) {
    return null;
  }

  return JSON.parse(item) as T;
}

export function useStickyState<T>(
  localStorageId: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storedValue = React.useSyncExternalStore(
    (onStoreChange) => subscribe(localStorageId, onStoreChange),
    () => localStorage.getItem(localStorageId),
    () => null
  );
  const value = storedValue === null ? defaultValue : (JSON.parse(storedValue) as T);
  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (nextValue) => {
      const currentValue = getLocalStorageItem<T>(localStorageId) ?? defaultValue;
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(currentValue)
          : nextValue;
      localStorage.setItem(localStorageId, JSON.stringify(resolvedValue));
      window.dispatchEvent(
        new CustomEvent(StickyStateEvent, { detail: localStorageId })
      );
    },
    [defaultValue, localStorageId]
  );

  return [value, setValue];
}

function subscribe(localStorageId: string, onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === localStorageId) {
      onStoreChange();
    }
  }

  function handleStickyState(event: Event) {
    if ((event as CustomEvent<string>).detail === localStorageId) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(StickyStateEvent, handleStickyState);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(StickyStateEvent, handleStickyState);
  };
}
