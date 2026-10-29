'use client';

import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';
import { Experience } from '@/types/experience';

import { ExperienceGuestContent } from '../ExperienceGuestContent';
import { HostActionBar } from './HostActionBar';

/**
 * Host mode's About tab: the exact guest view, plus the one pair of CTAs a
 * host actually needs while looking at their own experience - buying a
 * ticket themselves (the same reservation flow a guest uses, which
 * `onBuyTickets` switches the drawer over to) and jumping into editing it.
 */
export const AboutHostTab = ({
  experience,
  onBuyTickets,
}: {
  experience: Experience;
  onBuyTickets: () => void;
}) => {
  const { openCreateExperience } = useCreateExperienceDrawer() ?? {
    openCreateExperience: () => {},
  };

  return (
    <>
      <ExperienceGuestContent experience={experience} />

      <HostActionBar
        primary={{
          label: 'Buy tickets',
          iconName: 'Ticket01Icon',
          onClick: onBuyTickets,
        }}
        secondary={{
          label: 'Edit experience',
          iconName: 'Edit04Icon',
          onClick: () => openCreateExperience({ experienceId: experience.id }),
        }}
      />
    </>
  );
};
