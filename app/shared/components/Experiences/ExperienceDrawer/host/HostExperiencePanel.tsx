'use client';

import { ComingSoon } from '@/app/shared/components/ComingSoon';
import { Experience } from '@/types/experience';
import { Ticket } from '@/types/ticket';

import { AboutHostTab } from './AboutHostTab';
import { GuestsHostTab } from './GuestsHostTab';
import { SalesHostTab } from './SalesHostTab';
import { TicketsCreatedHostTab } from './TicketsCreatedHostTab';
import { HostTabId } from './types';
import { HostView } from './useHostMode';

/**
 * Host mode's tab content, below the shared header + tab row ExperienceDrawer
 * already renders (the tab row lives there, sticky alongside the header,
 * rather than owning a second sticky block in here). "Tickets created" and
 * "Sales" are built to their own handoffs; About reuses the exact guest view -
 * a host looking at their own experience sees what everyone else does.
 * Moments/Analytics are explicitly out of scope there, so they stand in with
 * ComingSoon rather than a half-built page. Invited guests costs nothing
 * extra to wire for real: the experience record already carries
 * `guests`/`communities`.
 *
 * Nothing here scrolls on its own - the drawer's own panel is the one scroll
 * container (see components/ui/drawer.tsx), so a nested `overflow-y-auto`
 * would only add a second, confusing scrollbar.
 */
export const HostExperiencePanel = ({
  experience,
  hostTab,
  view,
  editingTicket,
  onEditTicket,
  onBackFromEdit,
  onBuyTickets,
}: {
  experience: Experience;
  hostTab: HostTabId;
  view: HostView;
  editingTicket: Ticket | null;
  onEditTicket: (ticket: Ticket) => void;
  onBackFromEdit: () => void;
  onBuyTickets: () => void;
}) => {
  if (view === 'editTicket' && editingTicket) {
    return (
      <TicketsCreatedHostTab
        experience={experience}
        view={view}
        editingTicket={editingTicket}
        onEditTicket={onEditTicket}
        onBackFromEdit={onBackFromEdit}
      />
    );
  }

  if (hostTab === 'created') {
    return (
      <TicketsCreatedHostTab
        experience={experience}
        view={view}
        editingTicket={editingTicket}
        onEditTicket={onEditTicket}
        onBackFromEdit={onBackFromEdit}
      />
    );
  }

  if (hostTab === 'guests') return <GuestsHostTab experience={experience} />;

  if (hostTab === 'about') {
    return <AboutHostTab experience={experience} onBuyTickets={onBuyTickets} />;
  }

  if (hostTab === 'sales') return <SalesHostTab experience={experience} />;

  const comingSoon = {
    moments: { feature: 'Moments', iconName: 'DashboardCircleIcon' },
    analytics: { feature: 'Analytics', iconName: 'PieChart06Icon' },
  }[hostTab];

  return (
    <div className="px-6 py-5">
      <ComingSoon feature={comingSoon.feature} iconName={comingSoon.iconName} />
    </div>
  );
};
