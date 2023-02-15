import React from "react";

export function getLocalStorageItem<T>(key: string): T | null {
  const item = localStorage.getItem(key);

  if (!item) {
    return null;
  }

  return JSON.parse(item) as T;
}

// shoutout to my boy josh comeau for this hook template.
// https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
export function useStickyState<T>(
  localStorageId: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => {
    const stickyValue = getLocalStorageItem<T>(localStorageId);
    return stickyValue !== null ? stickyValue : defaultValue;
  });

  React.useEffect(() => {
    localStorage.setItem(localStorageId, JSON.stringify(value));
  }, [localStorageId, value]);

  return [value, setValue];
}
