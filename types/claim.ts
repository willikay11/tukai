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
  // The API does not report a size, so only a document sent in this session has one
  fileSizeLabel?: string;
};

/**
 * A claim on one or more places, owned by a community.
 *
 * The API has no claim record: a claim is a place ownership per place plus the
 * community's verification application. ConnectPlaceDrawerContext remembers
 * which places and community the reader claimed together in this session, and
 * useResolvedClaim reads the live status and documents from the API.
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
