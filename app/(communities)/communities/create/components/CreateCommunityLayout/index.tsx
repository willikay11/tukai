'use client';

import { useCreateCommunityFlow } from '@/app/(communities)/communities/components/hooks/useCreateCommunityFlow';

import { LeftPanel } from '../LeftPanel';
import { RightPanel } from '../RightPanel';

export const CreateCommunityLayout = () => {
  const {
    uploadId,
    cityInputRef,
    form,
    uploadedFiles,
    cityInput,
    showCitySuggestions,
    invitedMembers,
    invitedCommunities,
    isSuccessDialogOpen,
    createdCommunityId,
    setUploadedFiles,
    setCityInput,
    setShowCitySuggestions,
    setInvitedMembers,
    setMemberSearchQuery,
    setInvitedCommunities,
    setIsSuccessDialogOpen,
    categories,
    availableCommunities,
    memberSearchResults,
    googlePlaces,
    isFetchingCommunities,
    isSearchingUsers,
    isFetchingGooglePlaces,
    isCreatingCommunity,
    handlers,
  } = useCreateCommunityFlow();

  // Extract form values for preview
  const name = form.getValues('communityName') || '';
  const description = form.getValues('description') || '';
  const visibility = form.getValues('visibility') || 'public';
  const formCategories = form.getValues('selectedCategories') || [];
  const photoUrl = uploadedFiles[0] ? URL.createObjectURL(uploadedFiles[0]) : null;

  return (
    <main className="grid min-h-screen grid-cols-12 gap-12 px-4 md:px-0">
      {/* Left panel — form */}
      <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-2">
        <LeftPanel
          form={form}
          uploadId={uploadId}
          cityInputRef={cityInputRef}
          cityInput={cityInput}
          showCitySuggestions={showCitySuggestions}
          invitedMembers={invitedMembers}
          invitedCommunities={invitedCommunities}
          isSuccessDialogOpen={isSuccessDialogOpen}
          createdCommunityId={createdCommunityId}
          setUploadedFiles={setUploadedFiles}
          setCityInput={setCityInput}
          setShowCitySuggestions={setShowCitySuggestions}
          setInvitedMembers={setInvitedMembers}
          setMemberSearchQuery={setMemberSearchQuery}
          setInvitedCommunities={setInvitedCommunities}
          setIsSuccessDialogOpen={setIsSuccessDialogOpen}
          categories={categories}
          availableCommunities={availableCommunities}
          memberSearchResults={memberSearchResults}
          googlePlaces={googlePlaces}
          isFetchingCommunities={isFetchingCommunities}
          isSearchingUsers={isSearchingUsers}
          isFetchingGooglePlaces={isFetchingGooglePlaces}
          isCreatingCommunity={isCreatingCommunity}
          onSubmit={handlers.onSubmit}
          onToggleCategory={handlers.toggleCategory}
        />
      </div>

      {/* Right panel — preview */}
      <div className="hidden lg:col-span-4 lg:col-start-8 xl:col-span-4 xl:col-start-8 3xl:col-span-3 3xl:col-start-8 lg:block">
        <RightPanel
          name={name}
          description={description}
          photoUrl={photoUrl}
          location={cityInput}
          selectedCategories={formCategories}
          visibility={visibility}
          categories={categories}
        />
      </div>
    </main>
  );
};
