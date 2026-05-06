'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { InvitedMember } from '@/components/ui/invite-members';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';

import { AboutStep } from './AboutStep';
import { CreateExperienceAbout } from './about';
import { CreateExperienceCommunity } from './community';
import { DateTypeStep, type DateTypeFormData } from './DateTypeStep';
import { ExperienceDates } from './dates';
import { CreateExperienceInvites } from './invites';
import { InviteGuestsStep } from './InviteGuestsStep/InviteGuestsStep';
import { CreateExperienceWallet } from './wallet';
import { TicketsStep } from './TicketsStep/TicketsStep';
import { Interest } from '@/types/interest';
import type { FormData } from '../hooks/useCreateExperienceFlow';
import { Wallet } from '@/types/payment';
import { WalletDetailsStep } from './WalletDetailsStep/WalletDetailsStep';
import { type RelativeValidityValue } from './RelativeValidityPicker/RelativeValidityPicker';

type AboutFormData = {
  photos: string[];
  title: string;
  visibility: 'public' | 'private';
  description: string;
  whatsIncluded: string;
  whatsNotIncluded: string;
  location: string;
  meetingPoint: string;
  meetingTime: string | null;
  categories: Interest[];
};

export type ExperienceStepId = 'community' | 'about' | 'dates-tickets' | 'guests' | 'wallet';

const STEPS_DEFAULT = [
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

const STEPS_MULTI_DAY = [
  {
    id: 'community',
    label: 'Community',
    icon: 'AddTeamIcon',
  },
  {
    id: 'dates-tickets',
    label: 'Dates & Tickets',
    icon: 'Ticket02Icon',
  },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon' },
];

const getSteps = (experienceType: 'one-time' | 'multi-day' | 'itinerary'): typeof STEPS_DEFAULT => {
  return experienceType === 'multi-day' ? STEPS_MULTI_DAY : STEPS_DEFAULT;
};

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
  aboutFormData?: AboutFormData;
  updateAboutFormData?: (data: Partial<AboutFormData>) => void;
  ticketsFormData?: {
    commission: 'host' | 'customer' | 'split';
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      amount: number;
      salesStartDate: string | null;
      salesStartTime: string | null;
      salesEndDate: string | null;
      salesEndTime: string | null;
      acceptPartialPayment: boolean;
      salesStartRelative: RelativeValidityValue | null;
      salesEndRelative: RelativeValidityValue | null;
      duplicateForEntirePeriod: boolean;
    }>;
  };
  updateTicketsFormData?: (data: Partial<{
    commission: 'host' | 'customer' | 'split';
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      amount: number;
      salesStartDate: string | null;
      salesStartTime: string | null;
      salesEndDate: string | null;
      salesEndTime: string | null;
      acceptPartialPayment: boolean;
      salesStartRelative: RelativeValidityValue | null;
      salesEndRelative: RelativeValidityValue | null;
      duplicateForEntirePeriod: boolean;
    }>;
  }>) => void;
  ticketsErrors?: Record<string, string>;
  communitiesForSelector?: Array<{ id: string; name: string; imageUrl: string }>;
  validateDateType?: () => boolean;
  validateAbout?: () => boolean;
  validateTickets?: () => boolean;
  inviteFormData?: {
    invitedGuests: InvitedMember[];
    invitedCommunityIds: string[];
  };
  updateInviteFormData?: (data: Partial<{
    invitedGuests: InvitedMember[];
    invitedCommunityIds: string[];
  }>) => void;
  walletFormData?: FormData['wallet'];
  updateWalletFormData?: (data: Partial<FormData['wallet']>) => void;
  walletErrors?: Record<string, string>;
  wallets?: Wallet[];
  isWalletsLoading?: boolean;
  hasSavedWallets?: boolean;
  walletMutations?: {
    createBankWallet: any;
    isCreatingBankWallet: boolean;
    createPhoneWallet: any;
    isCreatingPhoneWallet: boolean;
    patchBankWallet: any;
    isPatchingBankWallet: boolean;
    patchPhoneWallet: any;
    isPatchingPhoneWallet: boolean;
  };
  onPreviewAndPublish?: () => void;
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
  ticketsFormData,
  updateTicketsFormData,
  ticketsErrors = {},
  communitiesForSelector = [],
  validateDateType = () => true,
  validateAbout = () => true,
  validateTickets = () => true,
  inviteFormData,
  updateInviteFormData,

  walletFormData,
  updateWalletFormData,
  walletErrors = {},
  wallets = [],
  isWalletsLoading = false,
  hasSavedWallets = false,
  walletMutations,
  onPreviewAndPublish,}: CreateExperienceStepsProps) => {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
const canAccessDetailsSteps = Boolean(
    experience?.id || 
    selectedCommunityId || 
    formData?.community?.id
  );
  
  useEffect(() => {
    console.log("[steps.tsx] canAccessDetailsSteps calculated:", {
      canAccessDetailsSteps,
      'experience?.id': experience?.id,
      selectedCommunityId,
    });
  }, [experience?.id, selectedCommunityId]);

  useEffect(() => {
    console.log("[steps.tsx guard] Checking access - currentStep:", currentStep, "canAccessDetailsSteps:", canAccessDetailsSteps, "isLoadingExperience:", isLoadingExperience);
    // Allow 'about' step if community is selected, even without experience (will be created in about step)
    const canAccessStep = currentStep === 'about' 
      ? Boolean(formData?.community?.id) 
      : canAccessDetailsSteps;
    
    if (!isLoadingExperience && currentStep !== 'community' && !canAccessStep) {
      console.log("[steps.tsx guard] Access denied! Redirecting to community");
      onStepChange?.('community');
    }
  }, [canAccessDetailsSteps, currentStep, isLoadingExperience, onStepChange, formData?.community?.id]);

  const handleStepChange = (step: ExperienceStepId) => {
    if (step !== 'community' && !canAccessDetailsSteps) {
      return;
    }

    onStepChange?.(step);
  };

  const handleSaveContinue = () => {
    console.log("[handleSaveContinue] Called, validateDateType...");
    const isValid = validateDateType();
    console.log("[handleSaveContinue] validateDateType returned:", isValid);
    if (isValid) {
      const nextStep = formData?.experienceType === 'multi-day' ? 'dates-tickets' : 'about';
      console.log("[handleSaveContinue] Validation passed, moving to", nextStep, "step");
      onStepChange?.(nextStep);
    }
  };

  if (isLoadingExperience) {
    const steps = getSteps(formData?.experienceType || 'one-time');
    return (
      <Tabs value={currentStep} className="w-full">
        <TabsList className="h-auto w-full gap-2 bg-transparent p-0">
          {steps.map((step) => (
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

  const steps = getSteps(formData?.experienceType || 'one-time');

  return (
    <Tabs
      value={currentStep}
      onValueChange={(step) => handleStepChange(step as ExperienceStepId)}
      className="grid w-full grid-cols-1"
    >
      <TabsList className="col-span-1 justify-start flex h-auto w-full gap-2 bg-transparent p-0">
        {steps.map((step) => {
          // Check if about step is filled based on form data or experience
          const isAboutFilled = aboutFormData ?
            Boolean(
              aboutFormData.title?.trim() &&
              aboutFormData.description?.trim() &&
              aboutFormData.location?.trim() &&
              aboutFormData.photos?.length > 0
            ) :
            Boolean(experience?.id);

          const isDatesTicketsFilled = Boolean(experience?.tickets?.length || ticketsFormData?.items?.length > 0);
          const isGuestsFilled = inviteFormData ?
            Boolean(inviteFormData.invitedGuests?.length > 0 || inviteFormData.invitedCommunityIds?.length > 0) :
            false;
          const stepFilledMap: Record<string, boolean> = {
            community: canAccessDetailsSteps,
            about: isAboutFilled,
            'dates-tickets': isDatesTicketsFilled,
            guests: isGuestsFilled,
            wallet: hasSavedWallets,
          };
          const isFilled = stepFilledMap[step.id] ?? false;
          const isDisabled = step.id !== 'community' && !canAccessDetailsSteps;

          return (
            <TabsTrigger
              key={step.id}
              value={step.id}
              disabled={isDisabled}
              className={`inline-flex gap-2 rounded-full px-4 py-2 text-xs transition-colors data-[state=active]:border-b-[0px] data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 ${
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

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
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
              console.log("[steps.tsx] onSaveContinue called");
              const isValid = validateAbout();
              console.log("[steps.tsx] validateAbout returned:", isValid);
              console.log("[steps.tsx] aboutFormData:", aboutFormData);
              console.log("[steps.tsx] aboutErrors:", aboutErrors);
              if (isValid) {
                console.log("[steps.tsx] Validation passed, calling handleStepChange('dates-tickets')");
                handleStepChange('dates-tickets');
              } else {
                console.log("[steps.tsx] Validation failed");
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
        {ticketsFormData && updateTicketsFormData ? (
          <TicketsStep
            formData={ticketsFormData}
            dateTypeData={formData || { community: null, experiencePricing: 'paid', experienceType: 'one-time', isRecurring: false, date: null, startTime: null, endTime: null }}
            experiencePricing={formData?.experiencePricing || 'paid'}
            onChange={updateTicketsFormData}
            errors={ticketsErrors}
            onSaveContinue={() => {
              if (validateTickets()) {
                handleStepChange('guests');
              }
            }}
            onCancel={() => formData?.experienceType === 'multi-day' ? handleStepChange('community') : handleStepChange('about')}
            photos={aboutFormData?.photos}
            isRecurring={formData?.isRecurring}
            timeSlots={formData?.timeSlots}
            recurringDays={formData?.recurringDays}
            isMultiDay={formData?.experienceType === 'multi-day'}
            multiDayStartDate={formData?.multiDayStartDate}
            multiDayStartTime={formData?.multiDayStartTime}
            multiDayEndDate={formData?.multiDayEndDate}
            multiDayEndTime={formData?.multiDayEndTime}
            saveContinueLabel={formData?.experienceType === 'multi-day' ? 'See Tickets' : undefined}
          />
        ) : (
          <ExperienceDates
            experienceId={experience?.id || null}
            experience={experience}
            onDatesUpdatedSuccess={onDatesUpdatedSuccess}
            onItineraryCustomise={onItineraryCustomise}
          />
        )}
      </TabsContent>

      <TabsContent value="guests" className="col-span-1 mt-6">
        {inviteFormData && updateInviteFormData ? (
          <InviteGuestsStep
            formData={inviteFormData}
            onChange={updateInviteFormData}
            experienceId={experience?.id || null}
            experience={experience}
            onNext={() => handleStepChange('wallet')}
            onCancel={() => handleStepChange('dates-tickets')}
          />
        ) : (
          <CreateExperienceInvites
            experienceId={experience?.id || null}
            experience={experience}
            onInvitesChange={onInvitesChange}
            onNext={() => handleStepChange('wallet')}
          />
        )}
      </TabsContent>

      <TabsContent value="wallet" className="col-span-1 mt-6">
        {walletFormData && updateWalletFormData ? (
          <WalletDetailsStep
            formData={walletFormData}
            onChange={updateWalletFormData}
            errors={walletErrors}
            wallets={wallets}
            isWalletsLoading={isWalletsLoading}
            walletMutations={walletMutations || {}}
            onPreviewAndPublish={onPreviewAndPublish || (() => {})}
          />
        ) : (
          <CreateExperienceWallet />
        )}
      </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
