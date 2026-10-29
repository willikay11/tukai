'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import type { DraftPhoto } from '@/app/(communities)/communities/components/CreateCommunityDrawer/useCreateCommunityDrawer';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import {
  useCreateCommunity,
  useDeleteVerificationDocument,
  useGetCommunities,
  useSubmitCommunityVerification,
  useUploadVerificationDocument,
} from '@/app/shared/hooks/useCommunities';
import {
  useClaimPlaceOwnership,
  useCreatePlace,
  useDeletePlaceOwnership,
  usePlace,
  usePlaces,
} from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { useConnectPlaceDrawer as useConnectPlaceDrawerStore } from '@/context/ConnectPlaceDrawerContext';
import { ClaimDocument } from '@/types/claim';
import { Community } from '@/types/community';
import { Place } from '@/types/place';

import {
  EMPTY_NEW_PLACE_FIELDS,
  NewPlaceDraftFields,
  isNewPlaceComplete,
} from './claimSchema';
import { OWNERSHIP_DOCUMENT_TYPES, REQUIRED_DOCUMENT_COUNT } from './documentTypes';
import { useResolvedClaim } from './useResolvedClaim';

export type CommunityVisibility = 'public' | 'private';
export type PlaceSource = 'existing' | 'new';
export type NewPlaceDraft = NewPlaceDraftFields & { photos: DraftPhoto[] };
export type PendingDocument = { documentType: string; file: File };

const EMPTY_NEW_PLACE: NewPlaceDraft = { ...EMPTY_NEW_PLACE_FIELDS, photos: [] };

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** "A", "A and B", "A, B and C" - the handoff's own join rule for place names. */
export const joinPlaceNames = (names: string[]) => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

/**
 * Everything the Connect a place drawer needs: the draft itself, plus the
 * claims sent in this session (see ConnectPlaceDrawerContext), whose live
 * status and documents useResolvedClaim reads back from the API.
 */
export const useConnectPlaceDrawer = () => {
  // Always rendered inside its own provider (ConnectPlaceDrawerContext), so
  // this is never null here.
  const store = useConnectPlaceDrawerStore()!;
  const {
    isOpen,
    options,
    closeConnectPlace,
    getClaim,
    getClaimForPlace,
    submitClaim,
    resubmitDocuments,
    cancelClaim,
  } = store;

  const { data: session } = useSession();
  const userId = session?.user?.id ?? undefined;

  // Tracked by id, not by the claim object itself - looking it up fresh from
  // the store on every render is what lets a cancel or a resubmit (which
  // mutate the store's claims array) show up here immediately, instead of
  // this hook going on displaying a snapshot taken at submit time.
  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useGetCommunities({
    page: 1,
    enabled: Boolean(userId) && isOpen,
    createdBy: userId,
  });
  const communities: Community[] = useMemo(
    () => communitiesResponse?.data?.results ?? [],
    [communitiesResponse],
  );

  const [justSubmittedClaimId, setJustSubmittedClaimId] = useState<string | null>(null);
  const activeClaimId = justSubmittedClaimId ?? options.claimId;
  const displayedClaim = useResolvedClaim(
    activeClaimId ? getClaim(activeClaimId) : undefined,
    communities,
    isOpen,
  );

  const view: 'form' | 'documents' | 'claim' = displayedClaim
    ? justSubmittedClaimId
      ? 'claim'
      : options.view === 'documents'
        ? 'documents'
        : 'claim'
    : 'form';

  // ── Community ──
  const [selectedCommunityId, setSelectedCommunityId] = useState(options.communityId ?? '');
  const [isNewCommunityBoxOpen, setIsNewCommunityBoxOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityVisibility, setNewCommunityVisibility] = useState<CommunityVisibility>('public');

  useEffect(() => {
    if (!isOpen || view !== 'form') return;
    if (communities.length === 0) {
      setIsNewCommunityBoxOpen(true);
      return;
    }
    if (!selectedCommunityId && communities.length === 1) setSelectedCommunityId(communities[0].id);
  }, [isOpen, view, communities, selectedCommunityId]);

  // A fresh open (no claimId - not reopening an existing claim) starts a
  // clean draft, so one drawer instance can be reused claim after claim in
  // the same session without carrying the last one's state forward. This has
  // to run - and, since React fires effects in the order they were
  // registered, has to be REGISTERED - before the place-prefill effect below,
  // or a prefill delivered in the same render (e.g. a place already cached by
  // the query client) would be reset away the instant it arrives.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && !options.claimId) {
      resetDraft();
      setSelectedCommunityId(options.communityId ?? '');
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, options.claimId, options.communityId]);

  const { mutateAsync: createCommunityMutation, isPending: isCreatingCommunity } =
    useCreateCommunity();

  const handleCreateCommunity = async () => {
    const title = newCommunityName.trim();
    if (!title) return;

    try {
      const response = await createCommunityMutation({
        title,
        description: '',
        categoriesIds: [],
        isPublic: newCommunityVisibility === 'public',
        googleMapPlaceId: '',
        newPhotos: [],
        invitedMemberIds: [],
        invitedCommunityIds: [],
        invitedEmails: [],
      });

      const created = response?.data;
      if (created?.id) {
        setSelectedCommunityId(created.id);
        setIsNewCommunityBoxOpen(false);
        setNewCommunityName('');
        toast({
          description: `${title} is ready and will own this claim. Add a photo and a description from its page later.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Could not create this community',
        description: (error as Error)?.message,
        variant: 'destructive',
      });
    }
  };

  // ── Place: existing/new toggle, search, multi-place connect ──
  const [source, setSource] = useState<PlaceSource>('existing');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [connectedPlaces, setConnectedPlaces] = useState<Place[]>([]);
  const [newPlace, setNewPlace] = useState<NewPlaceDraft>(EMPTY_NEW_PLACE);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: placesResponse, isFetching: isSearchingPlaces } = usePlaces({
    page: 1,
    search: debouncedQuery,
    enabled: isOpen && source === 'existing' && debouncedQuery.length >= 2,
  });
  const searchResults: Place[] = placesResponse?.data?.results ?? [];

  // Preconnects the place passed via openConnectPlace({ placeId }), e.g. from
  // an unclaimed place's "Start claim"
  const { data: prefillPlaceResponse } = usePlace(
    options.placeId ?? null,
    isOpen && view === 'form' && Boolean(options.placeId),
  );
  useEffect(() => {
    const place: Place | undefined = prefillPlaceResponse?.data;
    if (!place) return;
    setConnectedPlaces((current) =>
      current.some((entry) => entry.id === place.id) ? current : [...current, place],
    );
    // Keyed on the id alone - a query hook that returns a fresh object
    // identity each time it resolves (its own cache update, a mocked test
    // double) must not re-add a place the reader just disconnected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillPlaceResponse?.data?.id]);

  const toggleConnectedPlace = (place: Place) => {
    setConnectedPlaces((current) =>
      current.some((entry) => entry.id === place.id)
        ? current.filter((entry) => entry.id !== place.id)
        : [...current, place],
    );
  };

  // "Yours" / "Claimed by {community}" need per-place ownership data the
  // search endpoint doesn't return - only this session's own mock claims are
  // reflected as locked (see ConnectPlaceDrawerContext).
  const getLockReasonForPlace = (placeId: string): 'inClaim' | null =>
    getClaimForPlace(placeId) ? 'inClaim' : null;

  const handleAddAsNewPlace = () => {
    setSource('new');
    setNewPlace((current) => ({ ...current, title: current.title || query.trim() }));
  };

  const { data: categories = [] } = useGetInterestCategories();

  const toggleNewPlaceCategory = (id: string) => {
    setNewPlace((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(id)
        ? current.categoryIds.filter((entry) => entry !== id)
        : [...current.categoryIds, id],
    }));
  };

  const addNewPlacePhotos = (files: File[]) => {
    const room = 6 - newPlace.photos.length;
    if (room <= 0) {
      toast({ description: 'You can add up to 6 photos.' });
      return;
    }
    const accepted: DraftPhoto[] = files.slice(0, room).map((file) => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setNewPlace((current) => ({ ...current, photos: [...current.photos, ...accepted] }));
  };

  const removeNewPlacePhoto = (id: string) => {
    setNewPlace((current) => {
      const target = current.photos.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return { ...current, photos: current.photos.filter((photo) => photo.id !== id) };
    });
  };

  const reorderNewPlacePhotos = (fromIndex: number, toIndex: number) => {
    setNewPlace((current) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return current;
      const photos = [...current.photos];
      const [moved] = photos.splice(fromIndex, 1);
      if (!moved) return current;
      photos.splice(toIndex, 0, moved);
      return { ...current, photos };
    });
  };

  const moveNewPlacePhoto = (id: string, direction: -1 | 1) => {
    setNewPlace((current) => {
      const index = current.photos.findIndex((photo) => photo.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.photos.length) return current;
      const photos = [...current.photos];
      [photos[index], photos[target]] = [photos[target], photos[index]];
      return { ...current, photos };
    });
  };

  // ── Documents ──
  const [pickedDocumentTypes, setPickedDocumentTypes] = useState<string[]>([
    OWNERSHIP_DOCUMENT_TYPES[0].value,
  ]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [notes, setNotes] = useState('');

  const togglePickedDocumentType = (value: string) => {
    setPickedDocumentTypes((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    );
  };

  const attachDocument = (documentType: string, file: File) => {
    setPendingDocuments((current) => [
      ...current.filter((entry) => entry.documentType !== documentType),
      { documentType, file },
    ]);
  };

  const [removedDocumentTypes, setRemovedDocumentTypes] = useState<string[]>([]);

  const sentDocuments: ClaimDocument[] =
    view === 'documents' && displayedClaim ? displayedClaim.documents : [];

  const removeDocument = (documentType: string) => {
    if (pendingDocuments.some((entry) => entry.documentType === documentType)) {
      setPendingDocuments((current) => current.filter((entry) => entry.documentType !== documentType));
      return;
    }
    setRemovedDocumentTypes((current) => [...current, documentType]);
  };

  const prefillKey = displayedClaim
    ? [displayedClaim.id, displayedClaim.notes, ...displayedClaim.documents.map((d) => d.id)].join('|')
    : '';

  // Documents mode opens prefilled with whatever was already sent
  useEffect(() => {
    if (isOpen && view === 'documents' && displayedClaim) {
      setPickedDocumentTypes(displayedClaim.documents.map((document) => document.documentType));
      setPendingDocuments([]);
      setRemovedDocumentTypes([]);
      setNotes(displayedClaim.notes ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefillKey is what identifies the sent documents
  }, [isOpen, view, prefillKey]);

  const keptSentDocuments = sentDocuments.filter(
    (sent) =>
      !removedDocumentTypes.includes(sent.documentType) &&
      !pendingDocuments.some((pending) => pending.documentType === sent.documentType),
  );
  const attachedCount = keptSentDocuments.length + pendingDocuments.length;
  const hasDocumentChanges = pendingDocuments.length > 0 || removedDocumentTypes.length > 0;

  // ── Submit readiness ──
  const isNewPlaceReady = isNewPlaceComplete(newPlace);
  const hasCommunity = Boolean(selectedCommunityId);
  const hasPlace = source === 'existing' ? connectedPlaces.length > 0 : isNewPlaceReady;
  const hasEnoughDocuments = attachedCount >= REQUIRED_DOCUMENT_COUNT;

  const missingStep: string | null =
    view === 'documents'
      ? !hasEnoughDocuments
        ? 'Attach at least two documents.'
        : !hasDocumentChanges
          ? 'Attach the document Tukai asked for.'
          : null
      : !hasCommunity
        ? communities.length === 0
          ? 'Create the community that will own it.'
          : 'Pick the community that will own it.'
        : !hasPlace
          ? source === 'existing'
            ? 'Search for your place and connect it.'
            : 'Add the business name, where it is, a short description and at least one category.'
          : !hasEnoughDocuments
            ? pendingDocuments.length === 0
              ? 'Attach at least two documents that prove ownership.'
              : 'Attach one more document. Claims need at least two.'
            : null;

  const canSubmit = missingStep === null;

  // ── Submit / resubmit / cancel ──
  const { mutateAsync: createPlace } = useCreatePlace();
  const { mutateAsync: claimPlaceOwnership } = useClaimPlaceOwnership();
  const { mutateAsync: submitVerification } = useSubmitCommunityVerification();
  const { mutateAsync: uploadDocument } = useUploadVerificationDocument();
  const { mutateAsync: deleteDocument } = useDeleteVerificationDocument();
  const { mutateAsync: deleteOwnership } = useDeletePlaceOwnership();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const toClaimDocuments = () =>
    pendingDocuments.map((document) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      documentType: document.documentType,
      fileName: document.file.name,
      fileSizeLabel: formatFileSize(document.file.size),
    }));

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let places = connectedPlaces;

      if (source === 'new') {
        const created = await createPlace({
          title: newPlace.title.trim(),
          description: newPlace.description.trim(),
          googleMapPlaceId: '',
          newPhotos: newPlace.photos.map((photo) => photo.file),
        });
        const createdPlace: Place | undefined = created?.data;
        if (!createdPlace) throw new Error('Could not create this place');
        places = [createdPlace];
      }

      for (const place of places) {
        await claimPlaceOwnership({ placeId: place.id, communityId: selectedCommunityId });
      }

      try {
        await submitVerification(selectedCommunityId);
      } catch {
        // An application is already open - the documents still belong on it
      }

      for (const document of pendingDocuments) {
        await uploadDocument({
          communityId: selectedCommunityId,
          documentType: document.documentType,
          file: document.file,
          notes: notes.trim() || undefined,
        });
      }

      const community = communities.find((entry) => entry.id === selectedCommunityId);

      const claim = submitClaim({
        communityId: selectedCommunityId,
        communityName: community?.title ?? (newCommunityName.trim() || 'Your community'),
        communityPhoto: community?.photos?.[0]?.photo,
        places: places.map((place) => ({
          id: place.id,
          title: place.title,
          slug: place.slug,
          locality: place.location?.city,
          photo: place.photos?.[0]?.photo,
          isOnTukai: true,
        })),
        documents: toClaimDocuments(),
        notes: notes.trim() || undefined,
      });

      // The drawer itself switches to "Your claim" right after this - that
      // status view is the confirmation, so no toast on top of it
      setJustSubmittedClaimId(claim.id);
    } catch (error) {
      toast({
        title: 'Could not submit this claim',
        description: (error as { message?: string })?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmitDocuments = async () => {
    if (!displayedClaim || !canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const replacedTypes = [...removedDocumentTypes, ...pendingDocuments.map((d) => d.documentType)];
      for (const document of sentDocuments.filter((sent) => replacedTypes.includes(sent.documentType))) {
        await deleteDocument({ communityId: displayedClaim.communityId, documentId: document.id });
      }

      for (const document of pendingDocuments) {
        await uploadDocument({
          communityId: displayedClaim.communityId,
          documentType: document.documentType,
          file: document.file,
          notes: notes.trim() || undefined,
        });
      }

      resubmitDocuments(
        displayedClaim.id,
        [...keptSentDocuments, ...toClaimDocuments()],
        notes.trim() || undefined,
      );
      toast({ description: 'Documents sent. Your claim is back under review.' });
      closeConnectPlace();
    } catch (error) {
      toast({
        title: 'Could not send these documents',
        description: (error as { message?: string })?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancelClaim = async () => {
    if (!displayedClaim) return;
    const placeNames = joinPlaceNames(displayedClaim.places.map((place) => place.title));

    try {
      for (const place of displayedClaim.places) {
        await deleteOwnership(place.id);
      }
      cancelClaim(displayedClaim.id);
      toast({ description: `Claim cancelled. ${placeNames} stays unclaimed.` });
    } catch (error) {
      toast({
        title: 'Could not cancel this claim',
        description: (error as { message?: string })?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelConfirmOpen(false);
    }
  };

  const resetDraft = () => {
    setSelectedCommunityId('');
    setIsNewCommunityBoxOpen(false);
    setNewCommunityName('');
    setNewCommunityVisibility('public');
    setSource('existing');
    setQuery('');
    setDebouncedQuery('');
    setConnectedPlaces([]);
    setNewPlace(EMPTY_NEW_PLACE);
    setPickedDocumentTypes([OWNERSHIP_DOCUMENT_TYPES[0].value]);
    setPendingDocuments([]);
    setRemovedDocumentTypes([]);
    setNotes('');
    setJustSubmittedClaimId(null);
  };

  const handleCancel = () => {
    resetDraft();
    closeConnectPlace();
  };

  const handleClose = () => closeConnectPlace();

  return {
    isOpen,
    view,
    displayedClaim,
    handleClose,
    community: {
      communities,
      isLoadingCommunities,
      selectedCommunityId,
      setSelectedCommunityId,
      isNewCommunityBoxOpen,
      setIsNewCommunityBoxOpen,
      // The box can't be closed once the reader owns zero communities - there
      // is nothing to fall back to
      canCloseNewCommunityBox: communities.length > 0,
      newCommunityName,
      setNewCommunityName,
      newCommunityVisibility,
      setNewCommunityVisibility,
      isCreatingCommunity,
      handleCreateCommunity,
    },
    place: {
      source,
      setSource: (next: PlaceSource) => {
        setSource(next);
        if (next === 'new') setConnectedPlaces([]);
      },
      query,
      setQuery,
      debouncedQuery,
      searchResults,
      isSearchingPlaces,
      connectedPlaces,
      toggleConnectedPlace,
      getLockReasonForPlace,
      handleAddAsNewPlace,
      newPlace,
      categories,
      toggleNewPlaceCategory,
      addNewPlacePhotos,
      removeNewPlacePhoto,
      reorderNewPlacePhotos,
      moveNewPlacePhoto,
      onNewPlaceFieldChange: (fields: Partial<NewPlaceDraftFields>) =>
        setNewPlace((current) => ({ ...current, ...fields })),
    },
    documents: {
      pickedDocumentTypes,
      togglePickedDocumentType,
      pendingDocuments,
      sentDocuments: keptSentDocuments,
      attachedCount,
      attachDocument,
      removeDocument,
    },
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
  };
};
