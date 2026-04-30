'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { InvitedMember } from '@/components/ui/invite-members';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetWallets } from '@/app/(experiences)/hooks/usePayment';
import { Button } from '@/components/ui/button';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

import { AboutStep } from './AboutStep';
import { CreateExperienceAbout } from './about';
import { CreateExperienceCommunity } from './community';
import { DateTypeStep, type DateTypeFormData } from './DateTypeStep';
import { ExperienceDates } from './dates';
import { CreateExperienceInvites } from './invites';
import { CreateExperienceWallet } from './wallet';

export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';

const STEPS = [
  {
    id: 'community',
    label: 'Community',
    icon: 'AddTeamIcon',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'InformationCircleIcon',
  },
  {
    id: 'dates-tickets',
    label: 'Dates & Tickets',
    icon: 'Ticket02Icon',
  },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon' },
];

interface CreateExperienceStepsProps {
  currentStep?: ExperienceStepId;
  onStepChange?: (step: ExperienceStepId) => void;
  onExperienceCreated?: (experienceId: string, step?: ExperienceStepId) => void;
  onDatesUpdatedSuccess?: (nextStep?: 'guests') => void;
  onItineraryCustomise?: (config: { startDate: string; endDate: string }) => void;
  onInvitesChange?: (members: InvitedMember[], communities: Community[]) => void;
  experience?: Experience;
  isLoadingExperience?: boolean;
  formData?: DateTypeFormData;
  updateFormData?: (data: Partial<DateTypeFormData>) => void;
  dateTypeErrors?: Record<string, string>;
  aboutErrors?: Record<string, string>;
  aboutFormData?: {
    photo: string | null;
    title: string;
    visibility: 'public' | 'private';
    description: string;
    whatsIncluded: string;
    whatsNotIncluded: string;
    location: string;
    meetingPoint: string;
    meetingTime: string | null;
    categories: string[];
  };
  updateAboutFormData?: (data: Partial<typeof aboutFormData>) => void;
  communitiesForSelector?: Array<{ id: string; name: string; imageUrl: string }>;
  validateDateType?: () => boolean;
  validateAbout?: () => boolean;
}

export const CreateExperienceSteps = ({
  currentStep = 'community',
  onStepChange,
  onExperienceCreated,
  onDatesUpdatedSuccess,
  onItineraryCustomise,
  onInvitesChange,
  experience,
  isLoadingExperience,
  formData,
  updateFormData,
  dateTypeErrors = {},
  aboutErrors = {},
  aboutFormData,
  updateAboutFormData,
  communitiesForSelector = [],
  validateDateType = () => true,
  validateAbout = () => true,
}: CreateExperienceStepsProps) => {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const { data: walletsResponse } = useGetWallets();
  const hasSavedWallets = (walletsResponse?.data?.results?.length ?? 0) > 0;
  const canAccessDetailsSteps = Boolean(experience?.id || selectedCommunityId);

  useEffect(() => {
    if (!isLoadingExperience && currentStep !== 'community' && !canAccessDetailsSteps) {
      onStepChange?.('community');
    }
  }, [canAccessDetailsSteps, currentStep, isLoadingExperience, onStepChange]);

  const handleStepChange = (step: ExperienceStepId) => {
    if (step !== 'community' && !canAccessDetailsSteps) {
      return;
    }

    onStepChange?.(step);
  };

  const handleSaveContinue = () => {
    if (validateDateType()) {
      onStepChange?.('about');
    }
  };

  if (isLoadingExperience) {
    return (
      <Tabs value={currentStep} className="w-full">
        <TabsList className="h-auto w-full gap-2 bg-transparent p-0">
          {STEPS.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-800 data-[state=active]:border-b-[0px] data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <div className="flex-shrink-0">
                <IconComponent iconName={step.icon} size={20} variant="twotone" />
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="inline sm:hidden">{step.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <CreateStepContentSkeleton />
      </Tabs>
    );
  }

  return (
    <Tabs
      value={currentStep}
      onValueChange={(step) => handleStepChange(step as ExperienceStepId)}
      className="grid w-full grid-cols-1"
    >
      <TabsList className="col-span-1 flex h-auto w-full gap-2 bg-transparent p-0">
        {STEPS.map((step) => {
          const isAboutFilled = Boolean(experience?.id);
          const isDatesTicketsFilled = Boolean(experience?.tickets?.length);
          const stepFilledMap: Record<string, boolean> = {
            community: canAccessDetailsSteps,
            about: isAboutFilled,
            'dates-tickets': isDatesTicketsFilled,
            guests: false,
            wallet: hasSavedWallets,
          };
          const isFilled = stepFilledMap[step.id] ?? false;
          const isDisabled = step.id !== 'community' && !canAccessDetailsSteps;

          return (
            <TabsTrigger
              key={step.id}
              value={step.id}
              disabled={isDisabled}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors data-[state=active]:border-b-[0px] data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 ${
                isFilled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex-shrink-0">
                <IconComponent
                  iconName={step.icon}
                  size={20}
                  variant={isFilled ? 'solid' : 'twotone'}
                />
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="inline sm:hidden">{step.label.split(' ')[0]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="community" className="col-span-1 mt-6">
        {formData && updateFormData ? (
          <div className="space-y-6">
            <DateTypeStep
              formData={formData}
              communityOptions={communitiesForSelector}
              onChange={updateFormData}
              errors={dateTypeErrors}
            />
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                className="text-sm font-medium text-red-600 hover:text-red-900"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveContinue}
                variant="gradient"
                className='rounded-[50px]'
              >
                Save & Continue
              </Button>
            </div>
          </div>
        ) : (
          <CreateExperienceCommunity
            selectedCommunityId={selectedCommunityId}
            onSelectCommunity={setSelectedCommunityId}
            onContinue={() => handleStepChange('about')}
          />
        )}
      </TabsContent>

      <TabsContent value="about" className="col-span-1 mt-6">
        {aboutFormData && updateAboutFormData ? (
          <AboutStep
            formData={aboutFormData}
            errors={aboutErrors}
            onFormDataChange={updateAboutFormData}
            onCancel={() => handleStepChange('community')}
            onSaveEdit={() => {
              if (validateAbout()) {
                // Stay on about step
              }
            }}
            onSaveContinue={() => {
              if (validateAbout()) {
                handleStepChange('dates-tickets');
              }
            }}
          />
        ) : (
          <CreateExperienceAbout
            experience={experience}
            onSuccess={(experienceId) => {
              onExperienceCreated?.(experienceId, 'dates-tickets');
            }}
          />
        )}
      </TabsContent>

      <TabsContent value="dates-tickets" className="col-span-1 mt-6">
        <ExperienceDates
          experienceId={experience?.id || null}
          experience={experience}
          onDatesUpdatedSuccess={onDatesUpdatedSuccess}
          onItineraryCustomise={onItineraryCustomise}
        />
      </TabsContent>

      <TabsContent value="guests" className="col-span-1 mt-6">
        <CreateExperienceInvites
          experienceId={experience?.id || null}
          onInvitesChange={onInvitesChange}
          onNext={() => handleStepChange('wallet')}
        />
      </TabsContent>

      <TabsContent value="wallet" className="col-span-1 mt-6">
        <CreateExperienceWallet />
      </TabsContent>
    </Tabs>
  );
};
