export type ClaimStatus = 'review' | 'more' | 'rejected' | 'approved' | 'cancelled';

export type ClaimPlaceSummary = {
  id: string;
  title: string;
  slug?: string;
  locality?: string;
  photo?: string;
  // False for a place created as part of this claim rather than connected
  // from Tukai's existing listings.
  isOnTukai: boolean;
};

export type ClaimDocument = {
  id: string;
  // One of OWNERSHIP_DOCUMENT_TYPES' values
  documentType: string;
  fileName: string;
  fileSizeLabel: string;
};

/**
 * A claim on one or more places, owned by a community.
 *
 * No backend endpoint returns this shape yet - status, cancellation and
 * multi-place claims are mocked locally in ConnectPlaceDrawerContext until
 * the API grows them. See that file for the mock store.
 */
export type Claim = {
  id: string;
  communityId: string;
  communityName: string;
  communityPhoto?: string;
  places: ClaimPlaceSummary[];
  documents: ClaimDocument[];
  notes?: string;
  status: ClaimStatus;
  // Tukai's note on a 'more' or 'rejected' claim
  reviewNote?: string;
  sentAt: string;
};
