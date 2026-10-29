'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { toast } from '@/app/shared/hooks/useToast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { useConnectPlaceDrawer as useConnectPlaceDrawerStore } from '@/context/ConnectPlaceDrawerContext';

import { CommunitySection } from './CommunitySection';
import { DocumentsSection } from './DocumentsSection';
import { NewPlaceForm } from './NewPlaceForm';
import { PlaceSection } from './PlaceSection';
import { SetupReservations } from './SetupReservations';
import { YourClaimView } from './YourClaimView';
import { joinPlaceNames, useConnectPlaceDrawer } from './useConnectPlaceDrawer';

const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

const TITLES = {
  form: 'Connect a business or place',
  documents: 'Add documents',
  claim: 'Your claim',
} as const;

/**
 * Connect a business or place: the drawer that replaces the old
 * `/places/claim` page. Reads its open state, prefill and the mock claim
 * store straight off ConnectPlaceDrawerContext - see
 * useConnectPlaceDrawer.ts for all of the form state and handlers.
 */
export const ConnectPlaceDrawer = () => {
  const { openConnectPlace } = useConnectPlaceDrawerStore()!;
  const {
    isOpen,
    view,
    displayedClaim,
    handleClose,
    community,
    place,
    documents,
    notes,
    setNotes,
    missingStep,
    canSubmit,
    isSubmitting,
    handleSubmit,
    handleResubmitDocuments,
    handleCancel,
    isCancelConfirmOpen,
    setIsCancelConfirmOpen,
    handleConfirmCancelClaim,
  } = useConnectPlaceDrawer();

  const onError = (message: string) =>
    toast({ title: 'That file cannot be used', description: message, variant: 'destructive' });

  const renderFooter = () => {
    if (view === 'form') {
      return (
        <>
          <button
            type="button"
            onClick={handleCancel}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>
          <span className="flex-1" aria-hidden="true" />
          <Button
            type="button"
            variant="lime"
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
            className="h-12 rounded-full px-6 text-[15px] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
          >
            Submit for review
          </Button>
        </>
      );
    }

    if (view === 'documents') {
      return (
        <>
          <button
            type="button"
            onClick={handleClose}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>
          <span className="flex-1" aria-hidden="true" />
          <Button
            type="button"
            variant="lime"
            onClick={handleResubmitDocuments}
            disabled={!canSubmit}
            isLoading={isSubmitting}
            className="h-12 rounded-full px-6 text-[15px] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
          >
            Resubmit for review
          </Button>
        </>
      );
    }

    // view === 'claim'
    if (!displayedClaim) return null;

    if (displayedClaim.status === 'more') {
      return (
        <Button
          type="button"
          variant="lime"
          onClick={() => openConnectPlace({ claimId: displayedClaim.id, view: 'documents' })}
          className="ml-auto h-12 rounded-full px-6 text-[15px]"
        >
          Add documents
        </Button>
      );
    }

    if (displayedClaim.status === 'rejected') {
      return (
        <Button
          type="button"
          variant="lime"
          // Prefills the community; the places themselves aren't recalled
          // here, since only their summaries (not the full Place records
          // search needs to reconnect them) are kept in the mock claim.
          onClick={() => openConnectPlace({ communityId: displayedClaim.communityId })}
          className="ml-auto h-12 rounded-full px-6 text-[15px]"
        >
          Start a new claim
        </Button>
      );
    }

    if (
      displayedClaim.status === 'approved' &&
      displayedClaim.places.length === 1 &&
      displayedClaim.places[0].isOnTukai
    ) {
      return (
        <SetupReservations
          place={displayedClaim.places[0]}
          variant="footer"
          onNavigate={handleClose}
        />
      );
    }

    return (
      <Button
        type="button"
        variant="lime"
        onClick={handleClose}
        className="ml-auto h-12 rounded-full px-6 text-[15px]"
      >
        Done
      </Button>
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && handleClose()} width="medium">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            {TITLES[view]}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className={`${DISC} text-danger hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-9 pt-5">
          {view === 'form' && (
            <div className="flex flex-col gap-[26px]">
              <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-gray-800">
                Add details about your place
              </h2>

              <CommunitySection
                communities={community.communities}
                isLoadingCommunities={community.isLoadingCommunities}
                selectedCommunityId={community.selectedCommunityId}
                onSelect={community.setSelectedCommunityId}
                isNewCommunityBoxOpen={community.isNewCommunityBoxOpen}
                setIsNewCommunityBoxOpen={community.setIsNewCommunityBoxOpen}
                canCloseNewCommunityBox={community.canCloseNewCommunityBox}
                newCommunityName={community.newCommunityName}
                setNewCommunityName={community.setNewCommunityName}
                newCommunityVisibility={community.newCommunityVisibility}
                setNewCommunityVisibility={community.setNewCommunityVisibility}
                isCreatingCommunity={community.isCreatingCommunity}
                onCreateCommunity={community.handleCreateCommunity}
              />

              <div className="-mx-6 h-px bg-surface-muted" aria-hidden="true" />

              <PlaceSection
                source={place.source}
                onSourceChange={place.setSource}
                query={place.query}
                onQueryChange={place.setQuery}
                debouncedQuery={place.debouncedQuery}
                searchResults={place.searchResults}
                isSearchingPlaces={place.isSearchingPlaces}
                connectedPlaces={place.connectedPlaces}
                onToggleConnectedPlace={place.toggleConnectedPlace}
                onAddAsNewPlace={place.handleAddAsNewPlace}
                getLockReason={place.getLockReasonForPlace}
              />

              {place.source === 'new' && (
                <NewPlaceForm
                  draft={place.newPlace}
                  onFieldChange={place.onNewPlaceFieldChange}
                  onAddPhotos={place.addNewPlacePhotos}
                  onRemovePhoto={place.removeNewPlacePhoto}
                  onReorderPhotos={place.reorderNewPlacePhotos}
                  onMovePhoto={place.moveNewPlacePhoto}
                  categories={place.categories}
                  onToggleCategory={place.toggleNewPlaceCategory}
                />
              )}

              <div className="-mx-6 h-px bg-surface-muted" aria-hidden="true" />

              <DocumentsSection
                pickedDocumentTypes={documents.pickedDocumentTypes}
                onToggleDocumentType={documents.togglePickedDocumentType}
                pendingDocuments={documents.pendingDocuments}
                sentDocuments={documents.sentDocuments}
                attachedCount={documents.attachedCount}
                onAttach={documents.attachDocument}
                onRemove={documents.removeDocument}
                onError={onError}
              />

              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-semibold text-gray-800">
                  Notes <span className="font-normal text-ink-muted">(optional)</span>
                </span>
                <Textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Anything else Tukai should know about your business"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="rounded-xl border-line focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
                />
              </label>

              {missingStep && (
                <p className="-mt-2 flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-muted">
                  <IconComponent
                    iconName="InformationCircleIcon"
                    size={17}
                    color="currentColor"
                    className="mt-0.5 flex-shrink-0 text-brand"
                  />
                  {missingStep}
                </p>
              )}
            </div>
          )}

          {view === 'documents' && displayedClaim && (
            <div className="flex flex-col gap-[26px]">
              <div className="flex flex-col gap-3">
                <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-gray-800">
                  More documents for {joinPlaceNames(displayedClaim.places.map((p) => p.title))}
                </h2>
                <p className="flex items-start gap-2 rounded-xl bg-warn-surface p-3.5 text-sm leading-relaxed text-warn">
                  <IconComponent
                    iconName="InformationCircleIcon"
                    size={18}
                    color="currentColor"
                    className="mt-0.5 flex-shrink-0"
                  />
                  {displayedClaim.reviewNote ||
                    'Tukai needs another document before it can approve this claim.'}
                </p>
              </div>

              <DocumentsSection
                pickedDocumentTypes={documents.pickedDocumentTypes}
                onToggleDocumentType={documents.togglePickedDocumentType}
                pendingDocuments={documents.pendingDocuments}
                sentDocuments={documents.sentDocuments}
                attachedCount={documents.attachedCount}
                onAttach={documents.attachDocument}
                onRemove={documents.removeDocument}
                onError={onError}
              />

              <label className="flex flex-col gap-2">
                <span className="text-[15px] font-semibold text-gray-800">
                  Notes <span className="font-normal text-ink-muted">(optional)</span>
                </span>
                <Textarea
                  rows={3}
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="rounded-xl border-line focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
                />
              </label>

              {missingStep && (
                <p className="-mt-2 text-[13.5px] leading-relaxed text-ink-muted">{missingStep}</p>
              )}
            </div>
          )}

          {view === 'claim' && displayedClaim && (
            <YourClaimView
              claim={displayedClaim}
              onCancelClaim={() => setIsCancelConfirmOpen(true)}
              onNavigate={handleClose}
            />
          )}

          {view === 'claim' && !displayedClaim && (
            <p className="text-[15px] leading-relaxed text-ink-muted">
              This claim isn&apos;t available any more.
            </p>
          )}
        </div>

        <footer className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          {renderFooter()}
        </footer>
      </div>

      <AlertDialog open={isCancelConfirmOpen} onOpenChange={(open) => !open && setIsCancelConfirmOpen(false)}>
        <AlertDialogContent className="max-w-[420px] gap-[22px] rounded-[18px] p-6">
          <AlertDialogHeader className="space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-[21px] font-bold leading-tight tracking-[-0.3px] text-gray-900">
              Cancel this claim?
            </AlertDialogTitle>
            <p className="text-[15px] leading-relaxed text-ink-muted">
              {displayedClaim
                ? `${joinPlaceNames(displayedClaim.places.map((p) => p.title))} stays unclaimed. You can start a new claim any time.`
                : 'This place stays unclaimed. You can start a new claim any time.'}
            </p>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2 sm:space-x-0">
            <Button
              variant="destructive"
              onClick={handleConfirmCancelClaim}
              className="h-12 w-full rounded-full text-[15px]"
            >
              Cancel claim
            </Button>
            <button
              type="button"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="h-12 w-full rounded-full bg-surface text-[15px] font-semibold text-gray-900 hover:bg-surface-brand"
            >
              Keep claim
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
};
