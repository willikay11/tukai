'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

import { CommunityPreview } from './CommunityPreview';
import { CreateCommunityForm } from './CreateCommunityForm';
import { useCreateCommunityDrawer } from './useCreateCommunityDrawer';

const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

interface CreateCommunityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The canvas's "Create community" side panel - name, poster, type,
 * description, categories and invites, with a Preview pane that pushes in
 * over the same footer. Wired in from the Create menu; a future "Create an
 * experience" entry point can reuse it as-is once it needs one.
 */
export const CreateCommunityDrawer = ({ open, onOpenChange }: CreateCommunityDrawerProps) => {
  const {
    view,
    setView,
    photos,
    name,
    setName,
    description,
    setDescription,
    visibility,
    setVisibility,
    categoryIds,
    categories,
    invitedPeople,
    invitedCommunityIds,
    myCommunities,
    isFetchingMyCommunities,
    peopleQuery,
    setPeopleQuery,
    peopleResults,
    isSearchingPeople,
    isCreating,
    canSubmit,
    location,
    handlers,
  } = useCreateCommunityDrawer(onOpenChange);

  const isPreview = view === 'preview';

  const invitedCommunityNames = myCommunities
    .filter((community) => invitedCommunityIds.includes(community.id))
    .map((community) => community.title);

  return (
    <Drawer isOpen={open} setIsOpen={onOpenChange} width="narrow">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          {isPreview && (
            <button
              type="button"
              onClick={() => setView('form')}
              aria-label="Back"
              className={`${DISC} text-brand hover:bg-surface-brand`}
            >
              <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
            </button>
          )}

          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            {isPreview ? 'Preview community' : 'Create community'}
          </h2>

          {!isPreview && (
            <button
              type="button"
              onClick={() => setView('preview')}
              className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full px-3.5 text-[15px] font-medium text-brand transition-colors hover:bg-surface-brand"
            >
              <IconComponent iconName="ViewIcon" size={20} color="currentColor" />
              Preview
            </button>
          )}

          <button
            type="button"
            onClick={handlers.handleClose}
            aria-label="Close"
            className={`${DISC} text-danger hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-9 pt-5">
          {isPreview ? (
            <CommunityPreview
              photos={photos}
              name={name}
              description={description}
              visibility={visibility}
              categories={categories}
              selectedCategoryIds={categoryIds}
              invitedPeople={invitedPeople}
              invitedCommunityNames={invitedCommunityNames}
              city={location.city}
              lat={location.lat}
              lng={location.lng}
            />
          ) : (
            <CreateCommunityForm
              photos={photos}
              onAddPhotos={handlers.addPhotos}
              onRemovePhoto={handlers.removePhoto}
              onReorderPhotos={handlers.reorderPhotos}
              onMovePhoto={handlers.movePhoto}
              name={name}
              onNameChange={setName}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              description={description}
              onDescriptionChange={setDescription}
              categories={categories}
              selectedCategoryIds={categoryIds}
              onToggleCategory={handlers.toggleCategory}
              invitedPeople={invitedPeople}
              peopleQuery={peopleQuery}
              onPeopleQueryChange={setPeopleQuery}
              peopleResults={peopleResults}
              isSearchingPeople={isSearchingPeople}
              onAddPerson={handlers.addInvitedPerson}
              onRemovePerson={handlers.removeInvitedPerson}
              myCommunities={myCommunities}
              isFetchingMyCommunities={isFetchingMyCommunities}
              invitedCommunityIds={invitedCommunityIds}
              onToggleMyCommunity={handlers.toggleMyCommunity}
            />
          )}
        </div>

        <footer className="flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={handlers.handleCancel}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span className="flex-1" aria-hidden="true" />

          <Button
            type="button"
            variant="lime"
            onClick={handlers.handleSubmit}
            disabled={!canSubmit}
            isLoading={isCreating}
            className="h-12 rounded-full px-6 text-[15px] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
          >
            Create community
          </Button>
        </footer>
      </div>
    </Drawer>
  );
};
