'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { Drawer } from '@/components/ui/drawer';

import { DrawerFooter } from './DrawerShell/DrawerFooter';
import { Intro } from './DrawerShell/Intro';
import { LeaveDialog } from './DrawerShell/LeaveDialog';
import { ResumeBanner } from './DrawerShell/ResumeBanner';
import { StepTabs } from './DrawerShell/StepTabs';
import { ReviewView } from './Review/ReviewView';
import { type PlaceSelection, SelectPlacesView } from './SelectPlaces/SelectPlacesView';
import { AboutStep } from './steps/AboutStep';
import { DateTypeStep } from './steps/DateTypeStep';
import { InviteGuestsStep } from './steps/InviteGuestsStep';
import { ItineraryStep } from './steps/ItineraryStep';
import { TicketsStep } from './steps/TicketsStep';
import { WalletDetailsStep } from './steps/WalletDetailsStep';
import { useCreateExperienceDrawer } from './useCreateExperienceDrawer';

const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

/**
 * The Create experience drawer, rebuilt pixel-perfect against the
 * create-experience design handoff. State and API wiring are entirely
 * `useCreateExperienceDrawer` / `useCreateExperienceFlow` - this file is
 * shell + step routing only. See the Create-experience drawer plan for the
 * full component map.
 */
type SelectPlacesRequest = {
  multiple: boolean;
  headerTitle: string;
  contextLabel: string;
  alreadySelectedIds: string[];
  resolve: (result: PlaceSelection[] | null) => void;
};

export const CreateExperienceDrawer = () => {
  const drawer = useCreateExperienceDrawer();
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectPlacesRequest, setSelectPlacesRequest] = useState<SelectPlacesRequest | null>(null);

  if (!drawer) return null;

  const {
    isOpen,
    isResolvingEntry,
    isWizardVisible,
    latestDraft,
    isIntro,
    isClearingDraft,
    handleProceedToWizard,
    handleClearDraft,
    isLeaveConfirmOpen,
    isDiscarding,
    requestClose,
    handleSaveDraftAndExit,
    handleKeepEditing,
    handleDiscardExperience,
    handlePublished,
    flow,
    stepList,
    activeStepIndex,
    reachedStepIndex,
    isLastStep,
    handleStepChange,
    isReviewOpen,
    openReview,
    closeReview,
  } = drawer;

  const showResumeBanner = Boolean(latestDraft) && isWizardVisible;
  // No owned community yet - the rest of Date & type is dimmed and locked
  const hasOwnedCommunity = flow.communitiesForSelector.length > 0;

  const exitToHosting = () => {
    handleSaveDraftAndExit();
  };

  // Opens the Select-places sub-view (which owns its own header/body/footer)
  // and resolves once the host confirms or cancels - About's "where it
  // happens" (single) and Itinerary's "Add place" (multi, per day) both
  // drive this the same way.
  const requestSelectPlaces = (opts: {
    multiple: boolean;
    headerTitle: string;
    contextLabel: string;
    alreadySelectedIds?: string[];
  }) =>
    new Promise<PlaceSelection[] | null>((resolve) => {
      setSelectPlacesRequest({ ...opts, alreadySelectedIds: opts.alreadySelectedIds ?? [], resolve });
    });

  const handleRequestWherePlace = () => {
    requestSelectPlaces({
      multiple: false,
      headerTitle: 'Select the place',
      contextLabel: 'Pick the place on Tukai where the experience happens.',
    }).then((result) => {
      const picked = result?.[0];
      if (!picked) return;
      if (picked.source === 'tukai') {
        flow.updateAboutFormData({
          location: picked.name,
          locationPlaceId: '',
          placeId: picked.id,
          placeImageUrl: picked.imageUrl,
        });
      } else {
        flow.updateAboutFormData({
          location: picked.name,
          locationPlaceId: picked.id,
          placeId: null,
          placeImageUrl: null,
        });
      }
    });
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      const published = await flow.handlers.handlePublish();
      if (published) handlePublished();
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStep = () => {
    switch (flow.activeStep) {
      case 'dates-type':
        return <DateTypeStep flow={flow} hasOwnedCommunity={hasOwnedCommunity} />;
      case 'about':
        return <AboutStep flow={flow} onRequestWherePlace={handleRequestWherePlace} />;
      case 'itinerary-days':
        return (
          <ItineraryStep
            flow={flow}
            onRequestAddPlaces={(opts) =>
              requestSelectPlaces({
                multiple: true,
                headerTitle: 'Select places',
                contextLabel: `${opts.alreadySelectedPlaceIds.length} places selected.`,
                alreadySelectedIds: opts.alreadySelectedPlaceIds,
              })
            }
          />
        );
      case 'tickets':
        return <TicketsStep flow={flow} />;
      case 'guests':
        return <InviteGuestsStep flow={flow} />;
      case 'wallet':
        return <WalletDetailsStep flow={flow} />;
      default:
        return null;
    }
  };

  const currentStepId = stepList[activeStepIndex]?.id ?? 'dates-type';
  const primaryLabel = isLastStep ? 'Preview & publish' : 'Save & continue';

  // The one place every step's "Save & continue" / "Preview & publish"
  // action lives - each step component only renders its own fields, not a
  // footer, so there is exactly one of these per step id, not one per
  // component.
  const handlePrimaryAction = async () => {
    switch (currentStepId) {
      case 'dates-type':
        if (flow.validateDateType()) handleStepChange('about');
        return;
      case 'about': {
        if (!flow.validateAbout()) return;
        const saved = await flow.handlers.handleSaveAbout();
        if (saved === false) return;
        return;
      }
      case 'itinerary-days':
        await flow.handlers.handleSaveItineraryDays();
        return;
      case 'tickets':
        if (!flow.validateTickets()) return;
        await flow.handlers.handleUpdateFeesAllocation();
        handleStepChange('guests');
        return;
      case 'guests':
        handleStepChange('wallet');
        return;
      case 'wallet':
        if (flow.validateWallet()) openReview();
        return;
      default:
        return;
    }
  };

  if (selectPlacesRequest) {
    return (
      <Drawer isOpen={isOpen} setIsOpen={(open) => !open && requestClose()} width="narrow" mobile="full">
        <SelectPlacesView
          multiple={selectPlacesRequest.multiple}
          headerTitle={selectPlacesRequest.headerTitle}
          contextLabel={selectPlacesRequest.contextLabel}
          alreadySelectedIds={selectPlacesRequest.alreadySelectedIds}
          onConfirm={(places) => selectPlacesRequest.resolve(places)}
          onClose={() => {
            selectPlacesRequest.resolve(null);
            setSelectPlacesRequest(null);
          }}
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={(open) => !open && requestClose()}
      width={isReviewOpen ? 'medium' : 'narrow'}
      mobile="full"
    >
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-22 font-bold tracking-[-0.4px] text-gray-800">
            Create experience
          </h2>

          {!isIntro &&
            (isReviewOpen ? (
              <button
                type="button"
                onClick={closeReview}
                className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-[18px] text-[14.5px] font-semibold text-white"
              >
                <IconComponent iconName="Edit02Icon" size={18} color="currentColor" />
                Edit experience
              </button>
            ) : (
              <button
                type="button"
                onClick={openReview}
                className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full px-3.5 text-15 font-medium text-brand hover:bg-surface-brand"
              >
                <IconComponent iconName="ViewIcon" size={20} color="currentColor" />
                Preview
              </button>
            ))}

          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className={`${DISC} text-danger hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-9 pt-5">
          {isResolvingEntry || flow.isLoadingExperience ? (
            <CreateStepContentSkeleton />
          ) : !isWizardVisible && latestDraft ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-22 font-bold leading-tight text-gray-800">Continue your draft?</h2>
              <p className="text-15 leading-relaxed text-ink-muted">
                {latestDraft.title || 'Untitled experience'} is saved as a draft.
              </p>
              <button
                type="button"
                onClick={handleProceedToWizard}
                className="h-14 rounded-full bg-lime px-[30px] text-16 font-semibold text-brand-ink hover:bg-lime-dark"
              >
                Continue your draft
              </button>
              <button
                type="button"
                disabled={isClearingDraft}
                onClick={handleClearDraft}
                className="h-12 px-1.5 text-left text-15 font-medium text-danger disabled:opacity-60"
              >
                Start over
              </button>
            </div>
          ) : isIntro ? (
            <Intro onCreateExperience={handleProceedToWizard} />
          ) : isReviewOpen ? (
            <ReviewView flow={flow} onPublish={handlePublish} isPublishing={isPublishing} />
          ) : (
            <div className="flex flex-col gap-7">
              <StepTabs
                steps={stepList}
                activeStepIndex={activeStepIndex}
                reachedStepIndex={reachedStepIndex}
                onStepChange={handleStepChange}
                disabled={!hasOwnedCommunity && currentStepId === 'dates-type'}
              />
              {showResumeBanner && <ResumeBanner onStartOver={handleClearDraft} />}
              {renderStep()}
            </div>
          )}
        </div>

        {!isIntro && !isResolvingEntry && !flow.isLoadingExperience && isWizardVisible && (
          <DrawerFooter
            leftAction={
              isReviewOpen
                ? { label: 'Delete', onClick: handleDiscardExperience, variant: 'delete' }
                : { label: 'Cancel', onClick: requestClose, variant: 'cancel' }
            }
            onSaveAndExit={exitToHosting}
            onPrimary={isReviewOpen ? handlePublish : handlePrimaryAction}
            primaryLabel={isReviewOpen ? 'Publish experience' : primaryLabel}
            primaryDisabled={
              !isReviewOpen &&
              ((currentStepId === 'dates-type' && !hasOwnedCommunity) ||
                (currentStepId === 'wallet' &&
                  !flow.hasSavedWallets &&
                  !flow.formData.wallet.selectedWallet &&
                  !flow.formData.wallet.phoneNumber?.trim()))
            }
            isPrimaryLoading={isReviewOpen ? isPublishing : flow.isSavingExperience}
          />
        )}
      </div>

      <LeaveDialog
        open={isLeaveConfirmOpen}
        isDiscarding={isDiscarding}
        onSaveDraftAndExit={handleSaveDraftAndExit}
        onKeepEditing={handleKeepEditing}
        onDiscardExperience={handleDiscardExperience}
      />
    </Drawer>
  );
};
