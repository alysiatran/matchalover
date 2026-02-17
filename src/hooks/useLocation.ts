import { useState, useCallback } from "react";

const STORAGE_KEY = "matchaMoments_location";
const DEFAULT_LOCATION = "Seattle, WA";

export function useLocation() {
  const [location, setLocationState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCATION;
  });

  const setLocation = useCallback((loc: string) => {
    const trimmed = loc.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setLocationState(trimmed);
    }
  }, []);

  return { location, setLocation };
}
