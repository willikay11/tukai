'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tukai:recent-searches';
const LIMIT = 6;

// Every read and write is guarded: storage throws in private-mode Safari and
// is absent server-side, and a bad value should cost the user a suggestion
// list, not the search bar.
const readStored = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((term) => typeof term === 'string') : [];
  } catch {
    return [];
  }
};

const writeStored = (terms: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  } catch {
    // Nothing to recover — the list just will not persist
  }
};

/**
 * The terms this browser has searched for, newest first, kept in local storage.
 * Per-browser and never sent anywhere: there is no recent-searches endpoint.
 */
export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Read after mount rather than in the initial state — localStorage does not
  // exist while server-rendering, and seeding from it would make the first
  // client render disagree with the server's markup.
  useEffect(() => {
    setRecentSearches(readStored());
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((current) => {
      // Searching an old term again moves it to the front instead of
      // duplicating it
      const next = [
        trimmed,
        ...current.filter((existing) => existing.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, LIMIT);

      writeStored(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    writeStored([]);
    setRecentSearches([]);
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
};
