'use client';

import { InvitedGuestsTab } from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/InvitedGuestsTab';
import { useToast } from '@/app/shared/hooks/useToast';
import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';
import { Experience } from '@/types/experience';

import { HostActionBar } from './HostActionBar';

/**
 * Pairs the shared `InvitedGuestsTab` with the same `HostActionBar` Sales and
 * Tickets created use, so its CTAs get the same sticky-bottom bar and the
 * same h-12 pill sizing instead of the component's own inline, non-sticky
 * pair (`hideActions` turns that pair off - the page-based Manage Experience
 * route, this tab's other caller, keeps it, since that page has no action
 * bar of its own to fold it into).
 */
export const GuestsHostTab = ({ experience }: { experience: Experience }) => {
  const { openCreateExperience } = useCreateExperienceDrawer() ?? {
    openCreateExperience: () => {},
  };
  const { toast } = useToast();

  return (
    <>
      <div className="flex-1 px-6 py-5">
        <InvitedGuestsTab
          experienceId={experience.id}
          guests={experience.guests ?? []}
          communities={experience.communities ?? []}
          hideActions
        />
      </div>

      <HostActionBar
        primary={{
          label: 'Invite more guests',
          iconName: 'UserAdd02Icon',
          onClick: () => openCreateExperience({ experienceId: experience.id, step: 'guests' }),
        }}
        secondary={{
          label: 'Resend invites',
          iconName: 'Notification02Icon',
          onClick: () => toast({ description: 'Resending invites is not available yet.' }),
        }}
      />
    </>
  );
};
