import React from "react";

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

// shoutout to my boy josh comeau for this hook template.
// https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
// https://dev.to/joshwcomeau/comment/m114
export function useStickyState<T>(
  localStorageId: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(defaultValue);
  // Must be done here vs. in `setState` to handle `localStorage`
  // not defined at compile-time on server.
  React.useEffect(() => {
    const stickyValue = getLocalStorageItem<T>(localStorageId);
    if (stickyValue !== null) {
      setValue(stickyValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorageId]);

  React.useEffect(() => {
    localStorage.setItem(localStorageId, JSON.stringify(value));
  }, [localStorageId, value]);
  return [value, setValue];
}
