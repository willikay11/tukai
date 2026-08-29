'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { SectionShell } from '@/app/shared/components/Sections';
import {
  useGetCommunities,
  useSubmitCommunityVerification,
  useUploadVerificationDocument,
} from '@/app/shared/hooks/useCommunities';
import { useClaimPlaceOwnership, useCreatePlace, usePlace } from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { SuccessDialog } from '@/components/ui/successDialog';
import { Textarea } from '@/components/ui/textarea';
import { Community } from '@/types/community';
import { Place } from '@/types/place';

import { ClaimCommunitySection } from './components/ClaimCommunitySection';
import { ClaimPlaceSection, NewPlaceDraft, PlaceSource } from './components/ClaimPlaceSection';
import {
  OwnershipDocument,
  OwnershipDocumentsSection,
} from './components/OwnershipDocumentsSection';
import { OWNERSHIP_DOCUMENT_TYPES, REQUIRED_DOCUMENT_COUNT } from './documentTypes';

const EMPTY_NEW_PLACE: NewPlaceDraft = {
  title: '',
  description: '',
  address: '',
  googleMapPlaceId: '',
  photos: [],
};

export const ClaimPlaceContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id ?? undefined;

  // Reached from a place's reservation panel, which knows which place is being
  // claimed; reached from anywhere else, the reader searches for it here
  const placeIdParam = searchParams.get('placeId');
  // Set by the create-community detour below, so the community they just made
  // is already chosen when they land back here
  const communityIdParam = searchParams.get('communityId');

  const [selectedCommunityId, setSelectedCommunityId] = useState(communityIdParam ?? '');
  const [source, setSource] = useState<PlaceSource>('existing');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [newPlace, setNewPlace] = useState<NewPlaceDraft>(EMPTY_NEW_PLACE);
  const [activeDocumentType, setActiveDocumentType] = useState<string>(
    OWNERSHIP_DOCUMENT_TYPES[0].value,
  );
  const [documents, setDocuments] = useState<OwnershipDocument[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The place the claim went in for, kept so the confirmation can name it and
  // send the reader on once they are done reading it
  const [claimedPlace, setClaimedPlace] = useState<{ id: string; title: string } | null>(null);

  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useGetCommunities({
    page: 1,
    enabled: Boolean(userId),
    createdBy: userId,
  });
  const communities: Community[] = useMemo(
    () => communitiesResponse?.data?.results ?? [],
    [communitiesResponse],
  );

  // The place named in the URL, so the form opens on it already connected
  const { data: placeResponse } = usePlace(placeIdParam, Boolean(placeIdParam));
  useEffect(() => {
    const place: Place | undefined = placeResponse?.data;
    if (place) setSelectedPlace((current) => current ?? place);
  }, [placeResponse]);

  const { mutateAsync: createPlace } = useCreatePlace();
  const { mutateAsync: claimPlace } = useClaimPlaceOwnership();
  const { mutateAsync: submitVerification } = useSubmitCommunityVerification();
  const { mutateAsync: uploadDocument } = useUploadVerificationDocument();

  const returnHref = placeIdParam ? `/places/claim?placeId=${placeIdParam}` : '/places/claim';
  const createCommunityHref = `/communities/create?returnTo=${encodeURIComponent(returnHref)}`;

  // Ownership is held by a community, so someone who hosts none has nothing to
  // claim with — they make one first and come straight back here
  const hasNoCommunities =
    sessionStatus === 'authenticated' && !isLoadingCommunities && communities.length === 0;

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace(`/auth/sign-in?callbackUrl=${encodeURIComponent(returnHref)}`);
    }
  }, [sessionStatus, router, returnHref]);

  useEffect(() => {
    if (hasNoCommunities) router.replace(createCommunityHref);
  }, [hasNoCommunities, router, createCommunityHref]);

  // A community picked before the list arrived (from the create detour) is kept
  useEffect(() => {
    if (!selectedCommunityId && communities.length === 1) {
      setSelectedCommunityId(communities[0].id);
    }
  }, [communities, selectedCommunityId]);

  const isNewPlaceComplete =
    newPlace.title.trim().length > 0 &&
    newPlace.description.trim().length > 0 &&
    newPlace.googleMapPlaceId.length > 0 &&
    newPlace.photos.length > 0;

  const canSubmit =
    Boolean(selectedCommunityId) &&
    (source === 'existing' ? Boolean(selectedPlace) : isNewPlaceComplete) &&
    documents.length >= REQUIRED_DOCUMENT_COUNT &&
    !isSubmitting;

  const handleAttach = (document: OwnershipDocument) =>
    setDocuments((current) => [
      // One document per type — attaching again replaces it
      ...current.filter((entry) => entry.documentType !== document.documentType),
      document,
    ]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      // A place that is not on Tukai yet has to exist before it can be claimed
      let placeId = selectedPlace?.id;
      if (source === 'new') {
        const created = await createPlace({
          title: newPlace.title.trim(),
          description: newPlace.description.trim(),
          googleMapPlaceId: newPlace.googleMapPlaceId,
          newPhotos: newPlace.photos,
        });
        placeId = created?.data?.id;
      }

      if (!placeId) throw new Error('Could not resolve the place being claimed');

      await claimPlace({ placeId, communityId: selectedCommunityId });

      // Proof documents hang off the community's verification application, not
      // off the claim, so the application has to be open first. It rejects a
      // second one while a review is in flight, which is not a failure here.
      try {
        await submitVerification(selectedCommunityId);
      } catch {
        // An application is already open — the documents still belong on it
      }

      for (const document of documents) {
        await uploadDocument({
          communityId: selectedCommunityId,
          documentType: document.documentType,
          file: document.file,
          notes: notes.trim() || undefined,
        });
      }

      setClaimedPlace({
        id: placeId,
        title: source === 'new' ? newPlace.title.trim() : (selectedPlace?.title ?? 'this place'),
      });
    } catch (error) {
      // The services layer throws a plain { status, success, message }, not an
      // Error, so the message is read off it rather than off `error.message`
      const message = (error as { message?: string })?.message;
      toast({
        title: 'Could not submit this claim',
        description: message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nothing to show while the session resolves, or while a reader with no
  // community is on their way to create one
  if (sessionStatus === 'loading' || isLoadingCommunities || hasNoCommunities) {
    return (
      <PageContainer variant="detail" className="py-6 md:max-w-3xl">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  return (
    // Capped inside the detail column: a form of full-width fields reads far
    // wider than it needs to, so it keeps the left gutter and gives the extra
    // width back on the right
    <PageContainer variant="detail" className="py-6 md:max-w-3xl">
      <BackToExplore
        href={placeIdParam ? `/places/${placeIdParam}` : '/places'}
        label="Back to Explore"
      />

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-gray-900">Connect a business/place</h1>
        <p className="mt-2 text-sm text-gray-500">
          Claim a place your community owns or manages, so you can take reservations on Tukai.
        </p>
      </div>

      <div className="mt-6 space-y-10">
        <ClaimCommunitySection
          communities={communities}
          isLoading={isLoadingCommunities}
          selectedCommunityId={selectedCommunityId}
          createCommunityHref={createCommunityHref}
          onSelect={setSelectedCommunityId}
        />

        <ClaimPlaceSection
          source={source}
          selectedPlace={selectedPlace}
          newPlace={newPlace}
          onSourceChange={(next) => {
            setSource(next);
            if (next === 'new') setSelectedPlace(null);
          }}
          onSelectPlace={setSelectedPlace}
          onNewPlaceChange={setNewPlace}
        />

        <OwnershipDocumentsSection
          activeType={activeDocumentType}
          documents={documents}
          onSelectType={setActiveDocumentType}
          onAttach={handleAttach}
          onRemove={(documentType) =>
            setDocuments((current) =>
              current.filter((entry) => entry.documentType !== documentType),
            )
          }
          onError={(message) =>
            toast({
              title: 'That file cannot be used',
              description: message,
              variant: 'destructive',
            })
          }
        />

        <SectionShell
          id="claim-notes"
          title="Notes (Optional)"
          subtitle="Anything the review team should know about this claim."
        >
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="e.g. We took over the lease in January"
            aria-label="Notes"
            rows={4}
          />
        </SectionShell>

        <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
          <IconComponent
            iconName="InformationCircleIcon"
            size={18}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-primary"
          />
          <p className="text-sm text-gray-600">
            Claims are reviewed against your community&apos;s verification. Ownership is granted to
            the community, not to your personal account.
          </p>
        </div>

        <SuccessDialog
          open={Boolean(claimedPlace)}
          onOpenChange={(next) => {
            if (!next) setClaimedPlace(null);
          }}
          title="Request Submitted Successfully"
          description={`Your request to link ${claimedPlace?.title ?? ''} to your community has been sent. We will review and revert within 2 days.`}
          onAction={() => router.push(`/places/${claimedPlace?.id}`)}
        />

        <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="h-11 rounded-full px-6"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            className="h-11 rounded-full px-6"
            disabled={!canSubmit}
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit for review
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
