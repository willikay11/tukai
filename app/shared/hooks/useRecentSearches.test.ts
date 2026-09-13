import { act, renderHook } from '@testing-library/react';

import { useRecentSearches } from './useRecentSearches';

const STORAGE_KEY = 'tukai:recent-searches';

describe('useRecentSearches', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts empty', () => {
    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
  });

  it('reads what a previous visit stored', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['Hiking', 'Diani']));

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual(['Hiking', 'Diani']);
  });

  it('puts the newest term first and persists it', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => result.current.addRecentSearch('Hiking'));
    act(() => result.current.addRecentSearch('Beach clubs'));

    expect(result.current.recentSearches).toEqual(['Beach clubs', 'Hiking']);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) as string)).toEqual([
      'Beach clubs',
      'Hiking',
    ]);
  });

  // Searching something again should move it up, not list it twice
  it('promotes a repeated term rather than duplicating it', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => result.current.addRecentSearch('Hiking'));
    act(() => result.current.addRecentSearch('Diani'));
    act(() => result.current.addRecentSearch('hiking'));

    expect(result.current.recentSearches).toEqual(['hiking', 'Diani']);
  });

  it('ignores blank terms', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => result.current.addRecentSearch('   '));

    expect(result.current.recentSearches).toEqual([]);
  });

  it('trims what it stores', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => result.current.addRecentSearch('  Nyama choma  '));

    expect(result.current.recentSearches).toEqual(['Nyama choma']);
  });

  it('keeps only the six most recent', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((term) => result.current.addRecentSearch(term));
    });

    expect(result.current.recentSearches).toEqual(['g', 'f', 'e', 'd', 'c', 'b']);
  });

  it('clears the list', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => result.current.addRecentSearch('Hiking'));
    act(() => result.current.clearRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) as string)).toEqual([]);
  });

  // A corrupt or foreign value must cost a suggestion list, not the search bar
  it('survives unreadable stored data', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json');

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
  });

  it('discards non-string entries', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['Hiking', 42, null]));

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual(['Hiking']);
  });

  it('still works when storage throws', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });

    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.recentSearches).toEqual([]);

    getItem.mockRestore();
  });
});
