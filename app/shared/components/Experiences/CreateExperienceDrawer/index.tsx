'use client';

import { ResumeDraft } from '@/app/(experiences)/experiences/create/components/ResumeDraft';
import { CreateExperienceSteps } from '@/app/(experiences)/experiences/create/components/steps';
import { CreateStepContentSkeleton } from '@/app/shared/components/Cards';
import { IconComponent } from '@/app/shared/components/Icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

import { useCreateExperienceDrawer } from './useCreateExperienceDrawer';

const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

/**
 * The Create experience drawer: the same resume-draft gate and step wizard
 * as the full page (app/(experiences)/experiences/create/page.tsx), in a
 * sliding panel instead of a route. Reuses CreateExperienceSteps and
 * ResumeDraft as-is - see useCreateExperienceDrawer.ts for how the wizard
 * hook is wired with syncToUrl off, and for the Leave confirm, which is the
 * one genuinely new piece (every step already saves to the API immediately,
 * so there's no local draft state to protect, only the choice to keep or
 * discard what's already saved).
 */
export const CreateExperienceDrawer = () => {
  const drawer = useCreateExperienceDrawer();

  if (!drawer) return null;

  const {
    isOpen,
    isResolvingEntry,
    isWizardVisible,
    latestDraft,
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
  } = drawer;

  const handlePublish = async () => {
    const published = await flow.handlers.handlePublish();
    if (published) handlePublished();
    return published;
  };

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={(open) => !open && requestClose()}
      width="wide"
      mobile="full"
    >
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            Create experience
          </h2>

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
          {isResolvingEntry ? (
            <CreateStepContentSkeleton />
          ) : !isWizardVisible && latestDraft ? (
            <ResumeDraft
              draft={latestDraft}
              onContinue={handleProceedToWizard}
              onClearAndStartFresh={handleClearDraft}
              isClearing={isClearingDraft}
            />
          ) : (
            <CreateExperienceSteps
              currentStep={flow.activeStep}
              onStepChange={flow.handlers.handleStepChange}
              onExperienceCreated={flow.handlers.handleExperienceCreated}
              onDatesUpdatedSuccess={flow.handlers.handleDatesUpdatedSuccess}
              onItineraryCustomise={flow.handlers.handleItineraryCustomise}
              onInvitesChange={flow.handlers.handleInvitesChange}
              experience={flow.experience}
              isLoadingExperience={flow.isLoadingExperience}
              formData={flow.formData.dateType}
              updateFormData={flow.updateFormData}
              dateTypeErrors={flow.dateTypeErrors}
              aboutFormData={flow.formData.about}
              updateAboutFormData={flow.updateAboutFormData}
              aboutErrors={flow.aboutErrors}
              ticketsFormData={flow.formData.tickets}
              updateTicketsFormData={flow.updateTicketsFormData}
              ticketsErrors={flow.ticketsErrors}
              communitiesForSelector={flow.communitiesForSelector}
              validateDateType={flow.validateDateType}
              validateAbout={flow.validateAbout}
              validateTickets={flow.validateTickets}
              inviteFormData={flow.formData.invite}
              updateInviteFormData={flow.updateInviteFormData}
              itineraryDays={flow.formData.itineraryDays}
              updateItineraryDays={flow.updateItineraryDays}
              walletFormData={flow.formData.wallet}
              updateWalletFormData={flow.updateWalletFormData}
              walletErrors={flow.walletErrors}
              wallets={flow.wallets}
              isWalletsLoading={flow.isWalletsLoading}
              hasSavedWallets={flow.hasSavedWallets}
              walletMutations={flow.walletMutations}
              handlers={{
                handleSaveAbout: flow.handlers.handleSaveAbout,
                handleSaveItineraryDays: flow.handlers.handleSaveItineraryDays,
                handleDeleteItineraryDay: flow.handlers.handleDeleteItineraryDay,
                handlePublish,
                handleUpdateFeesAllocation: flow.handlers.handleUpdateFeesAllocation,
              }}
              isSavingExperience={flow.isSavingExperience}
              apiError={flow.apiError}
              registerFlusher={flow.registerFlusher}
              previewExperience={flow.previewExperience}
              slotTemplateRecords={flow.slotTemplateRecords}
              onPreviewAndPublish={() => {
                if (!flow.validateWallet()) return;
                flow.handlers.handleStepChange('preview');
              }}
            />
          )}
        </div>
      </div>

      <AlertDialog open={isLeaveConfirmOpen} onOpenChange={(open) => !open && handleKeepEditing()}>
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Save your experience before you leave?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
              You’ve added details that aren’t published yet. Save them as a draft to finish later
              from Host an experience, or discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2 sm:space-x-0">
            <Button
              variant="gradient"
              onClick={handleSaveDraftAndExit}
              className="h-12 w-full rounded-full text-[15px]"
            >
              Save draft &amp; exit
            </Button>
            <button
              type="button"
              onClick={handleKeepEditing}
              className="h-12 w-full rounded-full bg-surface text-[15px] font-semibold text-gray-900 hover:bg-surface-brand"
            >
              Keep editing
            </button>
            <Button
              variant="destructive"
              isLoading={isDiscarding}
              onClick={handleDiscardExperience}
              className="h-12 w-full rounded-full bg-transparent text-[15px] text-danger hover:bg-danger-surface"
            >
              Discard experience
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
};
