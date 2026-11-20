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
 * The API lists a claim per place (GET /v1/places/claims/, DEV-391), with its
 * status, when it was decided and the community's documents. This browser
 * remembers which places went in together (slices/claimsSlice.ts); the two
 * are merged in claims.ts, so a claim made on another device shows too.
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
  /** When Tukai approved or rejected it (DEV-427) */
  decidedAt?: string | null;
};

/**
 * One row of GET /v1/places/claims/ (DEV-391): a place ownership claim made
 * by the person, or for a community they run - one place each.
 */
export type PlaceClaimRow = {
  id: string;
  place: {
    id: string;
    slug?: string;
    title: string;
    location?: { city?: string | null; name?: string | null } | null;
    photos?: {
      photo?: string | null;
      photoWebpThumbUrl?: string | null;
      isCover?: boolean;
      order?: number;
    }[];
  };
  community: { id: string; slug?: string; title: string };
  claimedBy?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  /** When it was approved or rejected; null while pending (DEV-427) */
  decidedAt: string | null;
  /** The claiming community's latest verification */
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | null;
  documents: {
    id: string;
    documentType: string;
    fileUrl: string | null;
    notes: string;
    dateCreated: string;
  }[];
  dateCreated: string;
};
