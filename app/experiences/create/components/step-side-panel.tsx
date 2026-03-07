'use client';

import { ReactNode } from 'react';

import Image from 'next/image';

import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

import CreateTickets from './createTickets';
import ExperienceReview from './experienceReview';

export type ExperienceStepId = 'about' | 'dates-tickets' | 'guests' | 'wallet';

export default function ExperienceStepSidePanel({
  step,
  experienceId,
  experience,
  canShowDateTickets,
  invitedMembers,
  invitedCommunities,
}: {
  step: ExperienceStepId;
  experienceId?: string | null;
  experience?: Experience;
  canShowDateTickets?: boolean;
  invitedMembers?: InvitedMember[];
  invitedCommunities?: Community[];
}) {
  const stepPanelContent: Record<ExperienceStepId, ReactNode> = {
    about: (
      <StepPlaceholderContent
        title="Create Dates"
        description="Please add details to create dates"
      />
    ),
    'dates-tickets': canShowDateTickets ? (
      <CreateTickets experienceId={experienceId} experience={experience} />
    ) : (
      <StepPlaceholderContent
        title="Create Tickets"
        description="Update and save experience date and time first to continue."
      />
    ),
    guests: (
      <ExperienceReview
        experience={experience}
        invitedMembers={invitedMembers}
        invitedCommunities={invitedCommunities}
      />
    ),
    wallet: (
      <ExperienceReview
        experience={experience}
        invitedMembers={invitedMembers}
        invitedCommunities={invitedCommunities}
      />
    ),
  };
  const content = stepPanelContent[step];

  return (
    <div className="h-full rounded-t-xl border-x border-t border-gray-200 bg-white px-12 py-6 shadow-lg">
      {content}
    </div>
  );
}

function StepPlaceholderContent({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="mt-6 flex flex-col items-center justify-center">
        <Image src="/images/chilling.svg" alt={title} width={240} height={240} />
        <p className="mt-4 text-center text-xs text-gray-500">{description}</p>
      </div>
    </>
  );
}
