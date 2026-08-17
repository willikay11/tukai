'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ViewExperiencePageContent } from '@/app/(experiences)/experiences/[experienceId]/ViewExperiencePageContent';
import { ExperienceCreatedModal } from '@/app/(experiences)/experiences/create/components/ExperienceCreatedModal';
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

import type { FormData, FormPhoto } from '../../hooks/useCreateExperienceFlow';
import { type AboutFormValues } from '../../schemas';
import { AboutStep } from '../AboutStep';
import { type DateTypeFormData, DateTypeStep } from '../DateTypeStep';
import { InviteGuestsStep } from '../InviteGuestsStep';
import { ItineraryDaysStep } from '../ItineraryDaysStep';
import { type RelativeValidityValue } from '../RelativeValidityPicker';
import { SharedExperiencePreview } from '../SharedExperiencePreview';
import { TicketsStep } from '../TicketsStep';
import { WalletDetailsStep } from '../WalletDetailsStep';
import { CreateExperienceAbout } from '../about';
import { CreateExperienceCommunity } from '../community';
import { ExperienceDates } from '../dates';
import { CreateExperienceInvites } from '../invites';
import { CreateExperienceWallet } from '../wallet';

// Derived from the zod schema — never redeclare this shape by hand
type AboutFormData = AboutFormValues;

// The Preview step shows either the captured-data summary or the customer mirror
type PreviewMode = 'captured' | 'customer';

export type ExperienceStepId =
  | 'dates-type'
  | 'about'
  | 'itinerary-days'
  | 'tickets'
  | 'guests'
  | 'wallet'
  | 'preview';

const STEPS_DEFAULT = [
  {
    id: 'dates-type',
    label: 'Dates & Type',
    icon: 'CalendarIcon',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'InformationCircleIcon',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: 'Ticket02Icon',
  },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon' },
  { id: 'preview', label: 'Preview', icon: 'Monocle01Icon' },
];

const STEPS_MULTI_DAY = [
  {
    id: 'dates-type',
    label: 'Dates & Type',
    icon: 'CalendarIcon',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'InformationCircleIcon',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: 'Ticket02Icon',
  },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon' },
  { id: 'preview', label: 'Preview', icon: 'Monocle01Icon' },
];

const STEPS_ITINERARY = [
  {
    id: 'dates-type',
    label: 'Dates & Type',
    icon: 'CalendarIcon',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'InformationCircleIcon',
  },
  {
    id: 'itinerary-days',
    label: 'Itinerary',
    icon: 'RouteBlockIcon',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: 'Ticket02Icon',
  },
  { id: 'guests', label: 'Invite Guests', icon: 'AddTeamIcon' },
  { id: 'wallet', label: 'Wallet Details', icon: 'WalletAdd02Icon' },
  { id: 'preview', label: 'Preview', icon: 'Monocle01Icon' },
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
  // Form-derived Experience rendered by the Preview step
  previewExperience?: Experience;
  onPreviewAndPublish?: () => void;
  handlers?: {
    handleSaveAbout?: () => Promise<boolean | void>;
    handleSaveItineraryDays?: () => Promise<boolean | void>;
    handleDeleteItineraryDay?: (dayId: string) => Promise<boolean>;
    handlePublish?: () => Promise<boolean | void>;
    handleUpdateFeesAllocation?: () => Promise<void>;
  };
  isSavingExperience?: boolean;
  apiError?: string | null;
  registerFlusher?: (
    dayId: string,
    flusher: () => { title?: string; description?: string },
  ) => () => void;
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
  currentStep = 'dates-type',
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
  previewExperience,
  onPreviewAndPublish,
  handlers,
  isSavingExperience = false,
  apiError,
  registerFlusher,
  slotTemplateRecords = [],
  setSlotTemplateRecords,
}: CreateExperienceStepsProps) => {
  const router = useRouter();

  // Save & Exit lands on the user's hosted experiences
  const exitToHosting = () => router.push('/experiences?category=hosting');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const canAccessDetailsSteps = Boolean(
    experience?.id || selectedCommunityId || formData?.community?.id,
  );

  // ─── Preview step publishing ─────────────────────────────────────────────
  const [previewMode, setPreviewMode] = useState<PreviewMode>('captured');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishedModalOpen, setIsPublishedModalOpen] = useState(false);

  // Publishing needs the saved experience, not the synthetic preview id
  const publishableExperienceId = experience?.id;

  const handlePublishClick = async () => {
    if (!handlers?.handlePublish || isPublishing) return;

    setIsPublishing(true);
    try {
      // Errors are toasted by the hook; only success opens the modal
      const published = await handlers.handlePublish();
      if (published) setIsPublishedModalOpen(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishComplete = () => {
    setIsPublishedModalOpen(false);
    if (publishableExperienceId) {
      router.push(`/experiences/${publishableExperienceId}`);
    }
  };

  useEffect(() => {
    // Allow 'about' step if community is selected, even without experience (will be created in about step)
    const canAccessStep =
      currentStep === 'about' ? Boolean(formData?.community?.id) : canAccessDetailsSteps;

    if (!isLoadingExperience && currentStep !== 'dates-type' && !canAccessStep) {
      onStepChange?.('dates-type');
    }
  }, [
    canAccessDetailsSteps,
    currentStep,
    isLoadingExperience,
    onStepChange,
    formData?.community?.id,
  ]);

  const handleStepChange = (step: ExperienceStepId) => {
    if (step !== 'dates-type' && !canAccessDetailsSteps) {
      return;
    }

    onStepChange?.(step);
  };

  // Back to the step immediately before Preview — 'wallet' is last in all three
  // STEPS_* variants, so this holds for every experience type
  const handleKeepEditing = () => handleStepChange('wallet');

  const handleSaveContinue = () => {
    const isValid = validateDateType();
    if (isValid) {
      onStepChange?.('about');
    }
  };

  // The in-step Preview buttons used to open a mobile drawer showing the old
  // side panel; they now jump to the Preview step, which is the single preview
  const handlePreviewClick = () => {
    handleStepChange('preview');
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
          const isItineraryDaysFilled =
            formData?.experienceType !== 'itinerary'
              ? true
              : Boolean(
                  itineraryDays &&
                  itineraryDays.length > 0 &&
                  itineraryDays.every((day) => day.activities.some((a) => a.activityApiId != null)),
                );
          const stepFilledMap: Record<string, boolean> = {
            'dates-type': canAccessDetailsSteps,
            about: isAboutFilled,
            'itinerary-days': isItineraryDaysFilled,
            tickets: isDatesTicketsFilled,
            guests: isGuestsFilled,
            wallet: hasSavedWallets,
            // Preview is a read-only view — it is "filled" as soon as there is
            // something to look at
            preview: Boolean(previewExperience?.title),
          };
          const isFilled = stepFilledMap[step.id] ?? false;
          const isDisabled = step.id !== 'dates-type' && !canAccessDetailsSteps;

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

      {/* The stepper row above spans the full page width so every step stays
          visible; the form itself stays in a narrow left column. Preview is the
          exception — it renders the full customer detail layout. */}
      <div className="grid grid-cols-12 gap-4">
        <div
          className={
            currentStep === 'preview' ? 'col-span-12' : 'col-span-12 lg:col-span-6 xl:col-span-5'
          }
        >
          <TabsContent value="dates-type" className="col-span-1 mt-6">
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
                    variant="outline"
                    className="lg:hidden"
                  >
                    Preview
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
                onCancel={() => handleStepChange('dates-type')}
                onSaveEdit={async () => {
                  if (!validateAbout()) return;
                  const saved = await handlers?.handleSaveAbout?.();
                  if (saved !== false) exitToHosting();
                }}
                isSaving={isSavingExperience}
                onSaveContinue={async () => {
                  const isValid = validateAbout();
                  if (isValid) {
                    if (handlers?.handleSaveAbout) {
                      await handlers.handleSaveAbout();
                    } else {
                      handleStepChange('tickets');
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
                    formData?.experienceType === 'itinerary' ? 'itinerary-days' : 'tickets';
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
                onDeleteDay={handlers?.handleDeleteItineraryDay}
                onSaveContinue={() => {
                  if (handlers?.handleSaveItineraryDays) {
                    handlers.handleSaveItineraryDays();
                  } else {
                    handleStepChange('tickets');
                  }
                }}
                onSaveAndExit={async () => {
                  const saved = await handlers?.handleSaveItineraryDays?.();
                  if (saved !== false) exitToHosting();
                }}
                onCancel={() => handleStepChange('about')}
                isSaving={isSavingExperience}
                isParentSaving={isSavingExperience}
                registerFlusher={registerFlusher}
              />
            )}
          </TabsContent>

          <TabsContent value="tickets" className="col-span-1 mt-6">
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
                onCancel={() => handleStepChange('tickets')}
                onSaveAndExit={exitToHosting}
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
                onSaveAndExit={exitToHosting}
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

          <TabsContent value="preview" className="col-span-1 mt-6">
            {previewExperience && (
              <div>
                {/* Sticky 20px below the app header, which is `md:sticky md:top-0`
                    and ~64px tall. On mobile that header does not stick, so the
                    bar sits 20px from the viewport top. */}
                <div className="sticky top-5 z-30 mb-6 md:top-[84px]">
                  <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                      <p className="text-base font-bold text-gray-900">Preview</p>
                      <p className="mt-0.5 text-sm text-gray-400">
                        Everything you have captured so far. Edit any section to jump back to that
                        step.
                      </p>
                    </div>

                    {/* Same segmented control as the Experiences page filter
                        tabs: a grey track with a white active pill */}
                    <Tabs
                      value={previewMode}
                      onValueChange={(value) => setPreviewMode(value as PreviewMode)}
                      className="flex-shrink-0"
                    >
                      <TabsList className="h-auto gap-0 rounded-full bg-gray-100 p-1">
                        <TabsTrigger
                          value="captured"
                          className="rounded-full border-0 px-5 py-2 text-sm font-normal text-gray-500 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:font-normal data-[state=active]:text-primary"
                        >
                          What you captured
                        </TabsTrigger>
                        <TabsTrigger
                          value="customer"
                          className="rounded-full border-0 px-5 py-2 text-sm font-normal text-gray-500 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:font-normal data-[state=active]:text-primary"
                        >
                          Customer view
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {previewMode === 'captured' ? (
                  /* The same section components the removed side panel used —
                     each pencil jumps to the step that owns its data */
                  <div className="max-w-2xl">
                    <SharedExperiencePreview
                      showAllSections
                      experienceType={formData?.experienceType}
                      isRecurring={formData?.isRecurring}
                      aboutPhotos={aboutFormData?.photos}
                      aboutTitle={aboutFormData?.title}
                      aboutDescription={aboutFormData?.description}
                      aboutVisibility={aboutFormData?.visibility}
                      aboutWhatsIncluded={aboutFormData?.whatsIncluded}
                      aboutWhatsNotIncluded={aboutFormData?.whatsNotIncluded}
                      aboutLocation={aboutFormData?.location}
                      aboutMeetingPoint={aboutFormData?.meetingPoint}
                      aboutMeetingTime={aboutFormData?.meetingTime}
                      aboutCategories={aboutFormData?.categories}
                      selectedDate={formData?.date}
                      selectedStartTime={formData?.startTime}
                      selectedEndTime={formData?.endTime}
                      selectedRecurringDays={formData?.recurringDays}
                      selectedTimeSlots={formData?.timeSlots}
                      selectedRecurrenceStartDate={formData?.recurrenceStartDate}
                      selectedRecurrenceEndDate={formData?.recurrenceEndDate}
                      multiDayStartDate={formData?.multiDayStartDate}
                      multiDayStartTime={formData?.multiDayStartTime}
                      multiDayEndDate={formData?.multiDayEndDate}
                      multiDayEndTime={formData?.multiDayEndTime}
                      itineraryDays={itineraryDays}
                      itineraryStartDate={formData?.itineraryStartDate}
                      itineraryEndDate={formData?.itineraryEndDate}
                      selectedCommunity={
                        formData?.community
                          ? {
                              name: formData.community.name,
                              imageUrl: formData.community.imageUrl ?? '',
                            }
                          : null
                      }
                      ticketsItems={ticketsFormData?.items}
                      ticketsCommissionPayer={ticketsFormData?.commission}
                      invitedGuests={(inviteFormData?.invitedGuests ?? []).map((guest) => ({
                        ...guest,
                        name: guest.email?.split('@')[0] ?? 'Guest',
                      }))}
                      invitedCommunityIds={inviteFormData?.invitedCommunityIds}
                      allCommunities={communitiesForSelector}
                      selectedWallet={walletFormData?.selectedWallet}
                      onEditStep={(step) => handleStepChange(step as ExperienceStepId)}
                    />
                  </div>
                ) : (
                  /*
                    The REAL customer detail view — the same component
                    /experiences/[experienceId] renders. Never fork this into a
                    preview-specific copy; changes there must show up here.
                  */
                  <ViewExperiencePageContent experience={previewExperience} bookingMode="preview" />
                )}

                <div className="mt-8 flex justify-end">
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={handlePublishClick}
                    disabled={!publishableExperienceId || isPublishing}
                    className="flex w-fit items-center justify-center gap-2 rounded-full"
                  >
                    <IconComponent
                      iconName={isPublishing ? 'Loading03Icon' : 'RocketIcon'}
                      size={16}
                      color="currentColor"
                      className={isPublishing ? 'animate-spin text-white' : 'text-white'}
                    />
                    {isPublishing ? 'Publishing...' : 'Publish Experience'}
                  </Button>
                </div>

                {/* Reused from the removed review page's publish flow */}
                <ExperienceCreatedModal
                  open={isPublishedModalOpen}
                  onOpenChange={(open) => {
                    if (!open) handlePublishComplete();
                  }}
                  experienceId={publishableExperienceId}
                  onViewExperience={handlePublishComplete}
                />
              </div>
            )}
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
