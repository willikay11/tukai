'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { InvitedMember } from '@/components/ui/invite-members';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Interest } from '@/types/interest';
import { ItineraryDayFormValue } from '@/types/itinerary';
import { Wallet } from '@/types/payment';

import type { FormData } from '../../hooks/useCreateExperienceFlow';
import { AboutStep } from '../AboutStep';
import { type DateTypeFormData, DateTypeStep } from '../DateTypeStep';
import { InviteGuestsStep } from '../InviteGuestsStep';
import { ItineraryDaysStep } from '../ItineraryDaysStep';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { TicketsStep } from '../TicketsStep';
import { WalletDetailsStep } from '../WalletDetailsStep';
import { CreateExperienceAbout } from '../about';
import { CreateExperienceCommunity } from '../community';
import { ExperienceDates } from '../dates';
import { CreateExperienceInvites } from '../invites';
import { CreateExperienceWallet } from '../wallet';

type AboutFormData = {
  photos: string[];
  photoFiles: File[];
  title: string;
  visibility: 'public' | 'private';
  description: string;
  whatsIncluded: string;
  whatsNotIncluded: string;
  location: string;
  locationPlaceId: string;
  meetingPoint: string;
  meetingTime: string | null;
  categories: Interest[];
};

export type ExperienceStepId =
  | 'community'
  | 'about'
  | 'itinerary-days'
  | 'dates-tickets'
  | 'guests'
  | 'wallet';

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

const STEPS_ITINERARY = [
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
    id: 'itinerary-days',
    label: 'Itinerary',
    icon: 'MapIcon',
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
  if (experienceType === 'multi-day') return STEPS_MULTI_DAY;
  if (experienceType === 'itinerary') return STEPS_ITINERARY;
  return STEPS_DEFAULT;
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
  isPreviewDrawerOpen?: boolean;
  setIsPreviewDrawerOpen?: (isOpen: boolean) => void;
  ticketsFormData?: {
    commission: 'host' | 'customer' | 'split';
    ticketMode: 'entire-period' | 'each-day' | null;
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
  updateTicketsFormData?: (
    data: Partial<{
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
    }>,
  ) => void;
  ticketsErrors?: Record<string, string>;
  communitiesForSelector?: Array<{ id: string; name: string; imageUrl: string }>;
  validateDateType?: () => boolean;
  validateAbout?: () => boolean;
  validateTickets?: () => boolean;
  inviteFormData?: {
    invitedGuests: {
      id: string;
      email: string;
      dateCreated: string;
      status: 'invited' | 'accepted' | 'declined';
    }[];
    invitedCommunityIds: string[];
  };
  updateInviteFormData?: (
    data: Partial<{
      invitedGuests: {
        id: string;
        email: string;
        dateCreated: string;
        status: 'invited' | 'accepted' | 'declined';
      }[];
      invitedCommunityIds: string[];
    }>,
  ) => void;
  itineraryDays?: ItineraryDayFormValue[];
  updateItineraryDays?: (days: ItineraryDayFormValue[]) => void;
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
  handlers?: {
    handleSaveAbout?: () => Promise<void>;
    handleSaveItineraryDays?: () => Promise<void>;
    handlePublish?: () => Promise<void>;
    handleUpdateFeesAllocation?: () => Promise<void>;
  };
  isSavingExperience?: boolean;
  apiError?: string | null;
  registerFlusher?: (dayId: string, flusher: () => { title?: string; description?: string }) => () => void;
  slotTemplateRecords?: Array<{
    uiId: string;
    templateId: string;
    startTime: string;
    endTime: string;
    name?: string;
  }>;
  setSlotTemplateRecords?: (
    records: Array<{
      uiId: string;
      templateId: string;
      startTime: string;
      endTime: string;
      name?: string;
    }>,
  ) => void;
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
  itineraryDays = [],
  updateItineraryDays,
  walletFormData,
  updateWalletFormData,
  walletErrors = {},
  wallets = [],
  isWalletsLoading = false,
  hasSavedWallets = false,
  walletMutations,
  onPreviewAndPublish,
  handlers,
  isSavingExperience = false,
  apiError,
  registerFlusher,
  isPreviewDrawerOpen = false,
  setIsPreviewDrawerOpen,
  slotTemplateRecords = [],
  setSlotTemplateRecords,
}: CreateExperienceStepsProps) => {
  const router = useRouter();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const canAccessDetailsSteps = Boolean(
    experience?.id || selectedCommunityId || formData?.community?.id,
  );

  useEffect(() => {
    // Allow 'about' step if community is selected, even without experience (will be created in about step)
    const canAccessStep =
      currentStep === 'about' ? Boolean(formData?.community?.id) : canAccessDetailsSteps;

    if (!isLoadingExperience && currentStep !== 'community' && !canAccessStep) {
      onStepChange?.('community');
    }
  }, [
    canAccessDetailsSteps,
    currentStep,
    isLoadingExperience,
    onStepChange,
    formData?.community?.id,
  ]);

  const handleStepChange = (step: ExperienceStepId) => {
    if (step !== 'community' && !canAccessDetailsSteps) {
      return;
    }

    onStepChange?.(step);
  };

  const handleSaveContinue = () => {
    const isValid = validateDateType();
    if (isValid) {
      onStepChange?.('about');
    }
  };

  const handlePreviewClick = () => {
    setIsPreviewLoading(true);
    router.push(window.location.href);
    setIsPreviewDrawerOpen?.(true);
    setTimeout(() => setIsPreviewLoading(false), 1000);
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
      <TabsList className="col-span-1 flex h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 scrollbar-hide">
        {steps.map((step) => {
          // Check if about step is filled based on form data or experience
          const isAboutFilled = aboutFormData
            ? Boolean(
                aboutFormData.title?.trim() &&
                aboutFormData.description?.trim() &&
                aboutFormData.location?.trim() &&
                aboutFormData.photos?.length > 0,
              )
            : Boolean(experience?.id);

          const isDatesTicketsFilled = Boolean(
            experience?.tickets?.length || (ticketsFormData?.items?.length ?? 0) > 0,
          );
          const isGuestsFilled = inviteFormData
            ? Boolean(
                inviteFormData.invitedGuests?.length > 0 ||
                inviteFormData.invitedCommunityIds?.length > 0,
              )
            : false;
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
              className={`inline-flex flex-shrink-0 gap-1 rounded-full px-2 py-1.5 text-xs transition-colors data-[state=active]:border-b-[0px] data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 sm:gap-2 sm:px-4 sm:py-2 ${
                isFilled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex-shrink-0">
                <IconComponent
                  iconName={step.icon}
                  size={16}
                  variant={isFilled ? 'solid' : 'twotone'}
                  className="sm:w-5"
                />
              </div>
              <span className="hidden text-xs sm:inline">{step.label}</span>
              <span className="inline text-xs sm:hidden">{step.label.split(' ')[0]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <TabsContent value="community" className="col-span-1 mt-6">
            {formData && updateFormData ? (
              <div className="space-y-4">
                <DateTypeStep
                  formData={formData}
                  communityOptions={communitiesForSelector}
                  onChange={updateFormData}
                  errors={dateTypeErrors}
                />
                <div className="flex gap-2 lg:gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm font-medium text-red-600 hover:text-red-900"
                  >
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Button
                    type="button"
                    onClick={handlePreviewClick}
                    disabled={isPreviewLoading}
                    variant="outline"
                    className="lg:hidden"
                  >
                    {isPreviewLoading ? (
                      <IconComponent iconName="Loading03Icon" size={16} className="animate-spin" />
                    ) : (
                      'Preview'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveContinue}
                    variant="gradient"
                    className="rounded-[50px]"
                  >
                    Save & Continue
                  </Button>
                </div>
              </div>
            ) : (
              <CreateExperienceCommunity
                selectedCommunityId={selectedCommunityId}
                onSelectCommunity={(communityId) => {
                  setSelectedCommunityId(communityId);
                  // Also update form data with the selected community
                  const community = communitiesForSelector.find((c) => c.id === communityId);
                  if (community && updateFormData) {
                    updateFormData({
                      community: {
                        id: community.id,
                        title: community.name,
                        description: '',
                        categories: [],
                        isPublic: true,
                        status: 'active',
                        photos: [],
                        location: { latitude: 0, longitude: 0, address: '' },
                        members: [],
                        dateCreated: new Date().toISOString(),
                        dateModified: new Date().toISOString(),
                      } as any,
                    });
                  }
                }}
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
                isSaving={isSavingExperience}
                onSaveContinue={async () => {
                  const isValid = validateAbout();
                  if (isValid) {
                    if (handlers?.handleSaveAbout) {
                      await handlers.handleSaveAbout();
                    } else {
                      handleStepChange('dates-tickets');
                    }
                  }
                }}
                onPreview={handlePreviewClick}
              />
            ) : (
              <CreateExperienceAbout
                experience={experience}
                onSuccess={(experienceId) => {
                  const nextStep =
                    formData?.experienceType === 'itinerary' ? 'itinerary-days' : 'dates-tickets';
                  onExperienceCreated?.(experienceId, nextStep);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="itinerary-days" className="col-span-1 mt-6">
            {formData?.experienceType === 'itinerary' && experience?.id && (
              <ItineraryDaysStep
                experienceId={experience.id}
                days={itineraryDays}
                itineraryStartDate={formData?.dateType?.itineraryStartDate ?? null}
                onChange={(days) => {
                  updateItineraryDays?.(days);
                }}
                onSaveContinue={() => {
                  if (handlers?.handleSaveItineraryDays) {
                    handlers.handleSaveItineraryDays();
                  } else {
                    handleStepChange('dates-tickets');
                  }
                }}
                onCancel={() => handleStepChange('about')}
                isSaving={isSavingExperience}
                isParentSaving={isSavingExperience}
                registerFlusher={registerFlusher}
              />
            )}
          </TabsContent>

          <TabsContent value="dates-tickets" className="col-span-1 mt-6">
            {ticketsFormData && updateTicketsFormData ? (
              <TicketsStep
                formData={ticketsFormData}
                dateTypeData={
                  formData || {
                    community: null,
                    experiencePricing: 'paid',
                    experienceType: 'one-time',
                    isRecurring: false,
                    date: null,
                    startTime: null,
                    endTime: null,
                    recurringDays: [],
                    recurrenceStartDate: null,
                    recurrenceEndDate: null,
                    timeSlots: [],
                    multiDayStartDate: null,
                    multiDayStartTime: null,
                    multiDayEndDate: null,
                    multiDayEndTime: null,
                  }
                }
                experiencePricing={formData?.experiencePricing || 'paid'}
                onChange={updateTicketsFormData}
                errors={ticketsErrors}
                onSaveContinue={async () => {
                  if (validateTickets()) {
                    await handlers?.handleUpdateFeesAllocation?.();
                    handleStepChange('guests');
                  }
                }}
                onCancel={() => handleStepChange('about')}
                photos={aboutFormData?.photos.map((p) => p.url)}
                isRecurring={formData?.isRecurring}
                timeSlots={formData?.timeSlots}
                recurringDays={formData?.recurringDays}
                isMultiDay={formData?.experienceType === 'multi-day'}
                multiDayStartDate={formData?.multiDayStartDate}
                multiDayStartTime={formData?.multiDayStartTime}
                multiDayEndDate={formData?.multiDayEndDate}
                multiDayEndTime={formData?.multiDayEndTime}
                experienceId={experience?.id || null}
                onPreview={handlePreviewClick}
                slotTemplateRecords={slotTemplateRecords}
                setSlotTemplateRecords={setSlotTemplateRecords}
              />
            ) : (
              <ExperienceDates
                experienceId={experience?.id || null}
                experience={experience}
                locationPlaceId={aboutFormData?.locationPlaceId}
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
                onPreview={handlePreviewClick}
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
                walletMutations={
                  walletMutations || {
                    createBankWallet: () => {},
                    isCreatingBankWallet: false,
                    createPhoneWallet: () => {},
                    isCreatingPhoneWallet: false,
                    patchBankWallet: () => {},
                    isPatchingBankWallet: false,
                    patchPhoneWallet: () => {},
                    isPatchingPhoneWallet: false,
                  }
                }
                onPreviewAndPublish={onPreviewAndPublish || (() => {})}
              />
            ) : (
              <CreateExperienceWallet
                wallets={wallets}
                isWalletsLoading={isWalletsLoading}
                selectedWallet={undefined}
                onSelectedWalletChange={() => {}}
                paymentMethod="phone"
                onPaymentMethodChange={() => {}}
                phoneNumber=""
                onPhoneNumberChange={() => {}}
                onCreatePhoneWallet={() => {}}
                isCreatingPhoneWallet={false}
                onPatchPhoneWallet={() => {}}
                isPatchingPhoneWallet={false}
                onCreateBankWallet={() => {}}
                isCreatingBankWallet={false}
                onPatchBankWallet={() => {}}
                isPatchingBankWallet={false}
                onPreviewAndPublish={onPreviewAndPublish || (() => {})}
              />
            )}
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
