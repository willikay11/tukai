import { useEffect, useState } from 'react';

import { Ticket } from '@/types/ticket';

import { HostTabId } from './types';

export type HostView = 'tab' | 'editTicket';

/**
 * Host-mode navigation within the experience drawer: which of the six tabs is
 * showing, and whether "Edit ticket details" is open on top of it. Resets
 * whenever the drawer opens on a different experience (ED-host behaviour #2)
 * or lands on a specific tab (the Dashboard's stat chips).
 */
export const useHostMode = (experienceId: string | null, initialTab?: HostTabId) => {
  const [hostTab, setHostTab] = useState<HostTabId>(initialTab ?? 'about');
  const [view, setView] = useState<HostView>('tab');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    setHostTab(initialTab ?? 'about');
    setView('tab');
    setEditingTicket(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId]);

  const selectTab = (tab: HostTabId) => {
    setHostTab(tab);
    setView('tab');
  };

  const openEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setView('editTicket');
  };

  const closeEditTicket = () => {
    setEditingTicket(null);
    setView('tab');
  };

  return { hostTab, selectTab, view, editingTicket, openEditTicket, closeEditTicket };
};
