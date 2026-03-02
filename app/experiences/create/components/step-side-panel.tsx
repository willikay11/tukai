'use client';

import { ReactNode } from 'react';

import Image from 'next/image';

import CreateTickets from './createTickets';

export type ExperienceStepId = 'about' | 'dates-tickets' | 'guests' | 'wallet';

export default function ExperienceStepSidePanel({
  step,
  experienceId,
}: {
  step: ExperienceStepId;
  experienceId?: string | null;
}) {
  const stepPanelContent: Record<ExperienceStepId, ReactNode> = {
    about: (
      <StepPlaceholderContent title="Create Dates" description="Please add details to create dates" />
    ),
    'dates-tickets': <CreateTickets experienceId={experienceId} />,
    guests: (
      <StepPlaceholderContent
        title="Invite Guests"
        description="Please add invite details for your guests"
      />
    ),
    wallet: (
      <StepPlaceholderContent
        title="Wallet Details"
        description="Please complete wallet details to continue"
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
