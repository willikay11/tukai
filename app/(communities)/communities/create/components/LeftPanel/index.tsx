'use client';

import { UseFormReturn } from 'react-hook-form';

import { useRouter, useSearchParams } from 'next/navigation';

import { CreateCommunityFormValues } from '@/app/(communities)/communities/components/hooks/useCreateCommunityFlow';
import { type FormPhoto, PhotoUploader } from '@/app/shared/components';
import { IconComponent } from '@/app/shared/components/Icons';
import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker';
import { Button } from '@/components/ui/button';
import { CategoryPill } from '@/components/ui/categoryPill';
import { CreateSuccessDialog as CommunityCreatedSuccessDialog } from '@/components/ui/createSuccessDialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InviteCommunities } from '@/components/ui/invite-communities';
import { InviteMembers } from '@/components/ui/invite-members';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { Textarea } from '@/components/ui/textarea';
import { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import { Interest } from '@/types/interest';

interface LeftPanelProps {
  form: UseFormReturn<CreateCommunityFormValues>;
  uploadId: string;
  cityInputRef: React.RefObject<HTMLDivElement>;
  cityInput: string;
  showCitySuggestions: boolean;
  invitedMembers: Array<Record<string, unknown>>;
  invitedCommunities: Array<Record<string, unknown>>;
  isSuccessDialogOpen: boolean;
  createdCommunityId: string | null;
  setUploadedFiles: (files: File[]) => void;
  setCityInput: (input: string) => void;
  setShowCitySuggestions: (show: boolean) => void;
  setInvitedMembers: (members: Array<Record<string, unknown>>) => void;
  setMemberSearchQuery: (query: string) => void;
  setInvitedCommunities: (communities: Array<Record<string, unknown>>) => void;
  setIsSuccessDialogOpen: (open: boolean) => void;
  categories: Interest[];
  availableCommunities: Array<Record<string, unknown>>;
  memberSearchResults: Array<Record<string, unknown>>;
  googlePlaces: Array<Record<string, unknown>>;
  isFetchingCommunities: boolean;
  isSearchingUsers: boolean;
  isFetchingGooglePlaces: boolean;
  isCreatingCommunity: boolean;
  onSubmit: (values: CreateCommunityFormValues) => void;
  onToggleCategory: (category: Interest) => void;
}

export const LeftPanel = ({
  form,
  uploadId,
  cityInputRef,
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
  onSubmit,
  onToggleCategory,
}: LeftPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Somewhere the reader was sent here from and has to get back to — claiming a
  // place, for instance, needs a community to claim on behalf of. The community
  // they just created travels back with them so it arrives already chosen.
  const returnTo = searchParams.get('returnTo');
  const returnHref =
    returnTo && createdCommunityId
      ? `${returnTo}${returnTo.includes('?') ? '&' : '?'}communityId=${createdCommunityId}`
      : returnTo;

  return (
    <div className="space-y-6 py-6">
      <CommunityCreatedSuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        viewCommunityHref={
          returnHref ?? (createdCommunityId ? `/communities/${createdCommunityId}` : '/communities')
        }
        viewCommunityLabel={returnHref ? 'Continue' : undefined}
        description={
          returnHref
            ? 'Your community was created successfully. You can now carry on where you left off.'
            : undefined
        }
        createExperienceHref={returnHref ? undefined : '/experiences/create'}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Community</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set up your community and invite members to get started
        </p>
      </div>

      {/* Info banner */}
      <div className="inline-flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <span className="mt-0.5 shrink-0">
          <IconComponent iconName="UserMultipleIcon" color="#3B82F6" size={16} />
        </span>
        <span className="text-xs text-gray-800">
          Think of a Community as your website, business, social media page or even a WhatsApp
          group. Having community will help you manage your experiences and keep members connected
          between experiences.
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Photo upload */}
          <FormField
            control={form.control}
            name="photos"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <PhotoUploader
                    photos={field.value || []}
                    onPhotoChange={() => {
                      form.clearErrors('photos');
                    }}
                    onPhotoFilesChange={(photos: FormPhoto[]) => {
                      field.onChange(photos);
                      form.clearErrors('photos');
                    }}
                    onPhotoDelete={() => {
                      form.clearErrors('photos');
                    }}
                    error={fieldState.error?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Community name */}
          <FormField
            control={form.control}
            name="communityName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Community Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visibility */}
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <p className="text-xs font-medium text-gray-600">
                  Community type (who can see or join the community)
                </p>
                <FormControl>
                  <PillRadioGroup
                    options={[
                      { value: 'public', label: 'Public (Everyone)' },
                      { value: 'private', label: 'Private (Only invited people)' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <LocationAutocompleteField
                    containerRef={cityInputRef}
                    value={cityInput}
                    showSuggestions={showCitySuggestions}
                    isLoading={isFetchingGooglePlaces}
                    suggestions={googlePlaces}
                    onValueChange={(value) => {
                      setCityInput(value);
                      setShowCitySuggestions(true);
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    onSelectSuggestion={(place: GoogleMapsAutocompletePrediction) => {
                      field.onChange(place.place_id);
                      setCityInput(place.description);
                      setShowCitySuggestions(false);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <p className="mb-2 text-xs font-bold text-gray-800">
                  Add your community description
                </p>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Grab people's attention with a detailed description about the community..."
                    className="rounded-[10px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categories */}
          <FormField
            control={form.control}
            name="selectedCategories"
            render={() => (
              <FormItem>
                <p className="text-xs font-bold text-gray-800">
                  Select a category the community falls under, e.g. Hiking, Safari, etc.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories && categories.length > 0
                    ? categories.map((category: Interest) => (
                        <CategoryPill
                          key={category.id}
                          category={category}
                          onClick={() => onToggleCategory(category)}
                        />
                      ))
                    : null}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invite section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-800">
              Invite your friends or members of other communities
            </p>
            <p className="text-xs text-gray-700">
              You can share invites individually or invite members of a given Communities that you
              own or are a member of.
            </p>

            <InviteMembers
              invitedMembers={invitedMembers}
              onMembersChange={setInvitedMembers}
              searchResults={memberSearchResults}
              isSearching={isSearchingUsers}
              onSearch={setMemberSearchQuery}
              debounceMs={500}
            />

            <InviteCommunities
              invitedCommunities={invitedCommunities}
              onCommunitiesChange={setInvitedCommunities}
              availableCommunities={availableCommunities}
              isLoading={isFetchingCommunities}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1 rounded-full"
              disabled={isCreatingCommunity}
            >
              {isCreatingCommunity ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
