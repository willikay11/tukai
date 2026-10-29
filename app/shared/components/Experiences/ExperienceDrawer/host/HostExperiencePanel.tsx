'use client';

import { PlaceDrawerTabs } from '@/app/shared/components/Places/PlaceDrawer/PlaceDrawerTabs';
import { ComingSoon } from '@/app/shared/components/ComingSoon';
import { Experience } from '@/types/experience';
import { Ticket } from '@/types/ticket';

import { InvitedGuestsTab } from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/InvitedGuestsTab';

import { HOST_TABS, HostTabId } from './types';
import { HostView } from './useHostMode';
import { TicketsCreatedHostTab } from './TicketsCreatedHostTab';

/**
 * Host mode's tab row + content, below the shared header ExperienceDrawer
 * already renders. Only "Tickets created" is built to the handoff's own
 * spec - About/Sales/Moments/Analytics are explicitly out of scope there, so
 * they stand in with ComingSoon rather than a half-built page. Invited
 * guests costs nothing extra to wire for real: the experience record already
 * carries `guests`/`communities`.
 */
export const HostExperiencePanel = ({
  experience,
  hostTab,
  onSelectTab,
  view,
  editingTicket,
  onEditTicket,
  onBackFromEdit,
}: {
  experience: Experience;
  hostTab: HostTabId;
  onSelectTab: (tab: HostTabId) => void;
  view: HostView;
  editingTicket: Ticket | null;
  onEditTicket: (ticket: Ticket) => void;
  onBackFromEdit: () => void;
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sticky top-0 z-[3] -mx-6 -mb-3 mt-0 bg-white px-6 py-3">
        <PlaceDrawerTabs tabs={HOST_TABS} activeId={hostTab} onSelect={(id) => onSelectTab(id as HostTabId)} />
      </div>

      {hostTab === 'created' && (
        <TicketsCreatedHostTab
          experience={experience}
          view={view}
          editingTicket={editingTicket}
          onEditTicket={onEditTicket}
          onBackFromEdit={onBackFromEdit}
        />
      )}

      {hostTab === 'guests' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <InvitedGuestsTab
            experienceId={experience.id}
            guests={experience.guests ?? []}
            communities={experience.communities ?? []}
          />
        </div>
      )}

      {hostTab === 'about' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ComingSoon feature="About" iconName="InformationCircleIcon" />
        </div>
      )}
      {hostTab === 'sales' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ComingSoon feature="Sales" iconName="CreditCardPosIcon" />
        </div>
      )}
      {hostTab === 'moments' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ComingSoon feature="Moments" iconName="DashboardCircleIcon" />
        </div>
      )}
      {hostTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ComingSoon feature="Analytics" iconName="PieChart06Icon" />
        </div>
      )}
    </div>
  );
};
