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
// also this for handling nextjs SSR
// https://upmostly.com/next-js/using-localstorage-in-next-js
export function useStickyState<T>(
  localStorageId: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(defaultValue);
  // Must be done here vs. in `setState` to handle `localStorage`
  // not defined at compile-time on server.
  React.useEffect(() => {
    const stickyValue = getLocalStorageItem<T>(localStorageId);
    setValue(stickyValue || defaultValue);
  }, [defaultValue, localStorageId]);

  React.useEffect(() => {
    localStorage.setItem(localStorageId, JSON.stringify(value));
  }, [localStorageId, value]);
  return [value, setValue];
}
