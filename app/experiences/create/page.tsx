'use client';

import { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { InvitedMember } from '@/components/ui/invite-members';
import { useFetchSingleExperience } from '@/hooks/experiences';
import { Community } from '@/types/community';

import ExperienceStepSidePanel from './components/step-side-panel';
import CreateExperienceSteps, { type ExperienceStepId } from './components/steps';

const EXPERIENCE_STEPS: ExperienceStepId[] = ['about', 'dates-tickets', 'guests', 'wallet'];

function parseExperienceStepId(step: string | null): ExperienceStepId | null {
  if (!step) {
    return null;
  }

  return EXPERIENCE_STEPS.includes(step as ExperienceStepId) ? (step as ExperienceStepId) : null;
}

export default function CreateExperiencePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const experienceIdFromUrl = searchParams.get('experienceId');
  const stepFromUrl = parseExperienceStepId(searchParams.get('step'));

  const [activeStep, setActiveStep] = useState<ExperienceStepId>(stepFromUrl || 'about');
  const [experienceId, setExperienceId] = useState<string | null>(experienceIdFromUrl);
  const [hasUpdatedDates, setHasUpdatedDates] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);
  const [invitedCommunities, setInvitedCommunities] = useState<Community[]>([]);

  const { data: experienceResponse, isLoading: isLoadingExperience } = useFetchSingleExperience(
    experienceId || '',
    true,
  );
  const experience = experienceResponse?.data;

  useEffect(() => {
    setExperienceId(experienceIdFromUrl);
    setHasUpdatedDates(false);
  }, [experienceIdFromUrl]);

  useEffect(() => {
    if (stepFromUrl) {
      setActiveStep(stepFromUrl);
    }
  }, [stepFromUrl]);

  // Auto-show tickets panel if experience already has dates filled
  useEffect(() => {
    if (experience?.startDate && experience?.endDate) {
      setHasUpdatedDates(true);
    }
  }, [experience]);

  const replaceCreateUrlParams = (
    nextValues: Partial<{ experienceId: string | null; step: ExperienceStepId }>,
  ) => {
    const mergedExperienceId =
      nextValues.experienceId !== undefined ? nextValues.experienceId : experienceId;
    const mergedStep = nextValues.step !== undefined ? nextValues.step : activeStep;

    const params = new URLSearchParams(searchParams.toString());

    if (mergedExperienceId) {
      params.set('experienceId', mergedExperienceId);
    } else {
      params.delete('experienceId');
    }

    params.set('step', mergedStep);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStepChange = (step: ExperienceStepId) => {
    setActiveStep(step);
    replaceCreateUrlParams({ step });
  };

  const handleExperienceCreated = (createdExperienceId: string, step?: ExperienceStepId) => {
    setExperienceId(createdExperienceId);

    if (step) {
      setActiveStep(step);
    }

    replaceCreateUrlParams({ experienceId: createdExperienceId, step });
  };

  return (
    <main className="mt-6 grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-2 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
        <CreateExperienceSteps
          currentStep={activeStep}
          onStepChange={handleStepChange}
          onExperienceCreated={handleExperienceCreated}
          onDatesUpdatedSuccess={(nextStep) => {
            setHasUpdatedDates(true);

            if (nextStep) {
              setActiveStep(nextStep);
              replaceCreateUrlParams({ step: nextStep });
            }
          }}
          onInvitesChange={(members, communities) => {
            setInvitedMembers(members);
            setInvitedCommunities(communities);
          }}
          experience={experience}
          isLoadingExperience={isLoadingExperience}
        />
      </div>
      <div className="lg:col-span-4 lg:col-start-8">
        <ExperienceStepSidePanel
          step={activeStep}
          experienceId={experienceId}
          experience={experience}
          canShowDateTickets={hasUpdatedDates}
          invitedMembers={invitedMembers}
          invitedCommunities={invitedCommunities}
        />
      </div>
    </main>
  );
}
