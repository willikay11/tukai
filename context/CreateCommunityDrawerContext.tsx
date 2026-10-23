'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { CreateCommunityDrawer } from '@/app/(communities)/communities/components/CreateCommunityDrawer';

type CreateCommunityDrawerValue = {
  isOpen: boolean;
  openCreateCommunity: () => void;
  closeCreateCommunity: () => void;
};

const CreateCommunityDrawerContext = createContext<CreateCommunityDrawerValue | null>(null);

/**
 * One Create community drawer for the whole app - opened from the Create
 * menu (AuthActions), and from a successful hosting-plan subscription: a
 * new host needs a community to publish an experience under, so Subscribe
 * sends them straight here next instead of back to wherever they started.
 *
 * Mounted above HostingPlanProvider in app/layout.tsx so the Hosting plan
 * drawer (a sibling deeper in that provider) can reach this one too.
 */
export const CreateCommunityDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCreateCommunity = useCallback(() => setIsOpen(true), []);
  const closeCreateCommunity = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CreateCommunityDrawerValue>(
    () => ({ isOpen, openCreateCommunity, closeCreateCommunity }),
    [isOpen, openCreateCommunity, closeCreateCommunity],
  );

  return (
    <CreateCommunityDrawerContext.Provider value={value}>
      {children}
      <CreateCommunityDrawer open={isOpen} onOpenChange={setIsOpen} />
    </CreateCommunityDrawerContext.Provider>
  );
};

/**
 * Returns null outside the provider rather than throwing, so a component
 * can render in a test, or on a screen with no drawer, without one.
 */
export const useCreateCommunityDrawer = (): CreateCommunityDrawerValue | null =>
  useContext(CreateCommunityDrawerContext);
