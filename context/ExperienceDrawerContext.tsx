'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { ExperienceDrawer } from '@/app/shared/components/Experiences';

type ExperienceDrawerValue = {
  /** The experience currently open, or null. */
  openExperienceId: string | null;
  openExperience: (experienceId: string) => void;
  closeExperience: () => void;
};

const ExperienceDrawerContext = createContext<ExperienceDrawerValue | null>(null);

/**
 * One experience drawer for the whole app, the same shape as the place drawer.
 *
 * Held in state rather than the URL, for the reason PlaceDrawerContext gives:
 * the pages it sits over read their own search params. Every card still
 * carries its href, so a new tab opens the experience page.
 */
export const ExperienceDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [openExperienceId, setOpenExperienceId] = useState<string | null>(null);

  const openExperience = useCallback(
    (experienceId: string) => setOpenExperienceId(experienceId),
    [],
  );
  const closeExperience = useCallback(() => setOpenExperienceId(null), []);

  const value = useMemo(
    () => ({ openExperienceId, openExperience, closeExperience }),
    [openExperienceId, openExperience, closeExperience],
  );

  return (
    <ExperienceDrawerContext.Provider value={value}>
      {children}
      <ExperienceDrawer
        experienceId={openExperienceId}
        isOpen={Boolean(openExperienceId)}
        onClose={closeExperience}
      />
    </ExperienceDrawerContext.Provider>
  );
};

/**
 * Opens an experience over whatever the reader is looking at.
 *
 * Returns null outside the provider rather than throwing, so a card can render
 * in a test, or on a screen without a drawer, and simply keep its link.
 */
export const useExperienceDrawer = (): ExperienceDrawerValue | null =>
  useContext(ExperienceDrawerContext);
