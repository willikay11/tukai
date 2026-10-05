'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { PlaceDrawer } from '@/app/shared/components/Places';

type PlaceDrawerValue = {
  /** The place currently open, or null. */
  openPlaceId: string | null;
  openPlace: (placeId: string) => void;
  closePlace: () => void;
};

const PlaceDrawerContext = createContext<PlaceDrawerValue | null>(null);

/**
 * One place drawer for the whole app.
 *
 * A place is clickable from a dozen screens - Discover's rails, the places
 * list, search results, a featured banner - and threading an `onOpen` through
 * each of them would mean every new place card deciding for itself whether to
 * navigate or open. They all call this instead.
 *
 * ⚠️ Held in state rather than the URL. A query parameter would be linkable,
 * but it is also read by the pages this sits over: Discover drives its whole
 * search from `useSearchParams`, so pushing `?placeId=` there replaces the
 * rails with a result list behind the drawer. The place page itself is the
 * linkable form, and every card still carries its href for a new tab.
 */
export const PlaceDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);

  const openPlace = useCallback((placeId: string) => setOpenPlaceId(placeId), []);
  const closePlace = useCallback(() => setOpenPlaceId(null), []);

  const value = useMemo(
    () => ({ openPlaceId, openPlace, closePlace }),
    [openPlaceId, openPlace, closePlace],
  );

  return (
    <PlaceDrawerContext.Provider value={value}>
      {children}
      <PlaceDrawer placeId={openPlaceId} isOpen={Boolean(openPlaceId)} onClose={closePlace} />
    </PlaceDrawerContext.Provider>
  );
};

/**
 * Opens a place over whatever the reader is looking at.
 *
 * Returns null outside the provider rather than throwing, so a component can
 * be rendered in a test, or on a screen that has no drawer, without one.
 */
export const usePlaceDrawer = (): PlaceDrawerValue | null => useContext(PlaceDrawerContext);
