'use client';

import { TwoPanelLayout } from '@/app/shared/components/TwoPanelLayout';
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
    <TwoPanelLayout
      left={
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
      }
      right={
        <RightPanel
          name={name}
          description={description}
          photoUrl={photoUrl}
          location={cityInput}
          selectedCategories={formCategories}
          visibility={visibility}
          categories={categories}
        />
      }
    />
  );
};
