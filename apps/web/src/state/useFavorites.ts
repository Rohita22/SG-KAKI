import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sgmode:field-guide-favorites:v1';

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Locally-persisted favorite phrase/topic ids for the Field Guide. */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggle = useCallback((id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  return { favoriteIds, toggle };
}
