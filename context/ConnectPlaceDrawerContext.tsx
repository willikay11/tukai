'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ConnectPlaceDrawer } from '@/app/shared/components/Places/ConnectPlaceDrawer';
import { mergeClaims } from '@/app/shared/components/Places/ConnectPlaceDrawer/claims';
import { usePlaceClaims } from '@/app/shared/hooks/usePlaces';
import {
  addClaim,
  cancelClaim as cancelClaimAction,
  resubmitClaimDocuments,
} from '@/slices/claimsSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Claim, ClaimDocument, ClaimPlaceSummary, ClaimStatus } from '@/types/claim';

export type ConnectPlaceDrawerView = 'form' | 'documents' | 'claim';

export type OpenConnectPlaceOptions = {
  // Preconnects this place, e.g. from an unclaimed place's "Start claim"
  placeId?: string;
  // Preselects this community, e.g. returning from the create-community detour
  communityId?: string;
  // Opens straight into "Your claim" (or "Add documents") for an existing claim
  claimId?: string;
  view?: ConnectPlaceDrawerView;
};

export type SubmitClaimInput = {
  communityId: string;
  communityName: string;
  communityPhoto?: string;
  places: ClaimPlaceSummary[];
  documents: ClaimDocument[];
  notes?: string;
};

type ConnectPlaceDrawerValue = {
  isOpen: boolean;
  options: OpenConnectPlaceOptions;
  openConnectPlace: (opts?: OpenConnectPlaceOptions) => void;
  closeConnectPlace: () => void;
  /**
   * The person's claims, as the server has them (DEV-391): status, when it
   * was decided and documents, on every device. The places this browser
   * claimed together stay grouped as one claim; see claims.ts.
   */
  claims: Claim[];
  getClaimForPlace: (placeId: string) => Claim | undefined;
  getClaim: (claimId: string) => Claim | undefined;
  submitClaim: (input: SubmitClaimInput) => Claim;
  resubmitDocuments: (claimId: string, documents: ClaimDocument[], notes?: string) => void;
  cancelClaim: (claimId: string) => void;
};

const ConnectPlaceDrawerContext = createContext<ConnectPlaceDrawerValue | null>(null);

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * One "Connect a place" drawer for the whole app, opened from the Create
 * menu, Dashboard > Places, an unclaimed place's drawer, and the mobile place
 * bar.
 *
 * Also holds the person's claims: the server's list (DEV-391), with the
 * places this browser claimed together kept as one claim - see
 * slices/claimsSlice.ts and claims.ts.
 */
export const ConnectPlaceDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenConnectPlaceOptions>({});
  const sent = useSelector((state: RootState) => state.claimsReducer.claims);
  const dispatch = useDispatch<AppDispatch>();
  const { data: rows, dataUpdatedAt, refetch } = usePlaceClaims();
  const claims = useMemo(
    () => mergeClaims({ sent, rows: rows ?? null, listedAt: dataUpdatedAt }),
    [sent, rows, dataUpdatedAt],
  );
  // A claim sent, resent or cancelled shows on the server's list next read
  const refreshClaims = useCallback(() => void refetch(), [refetch]);

  const openConnectPlace = useCallback((opts?: OpenConnectPlaceOptions) => {
    setOptions(opts ?? {});
    setIsOpen(true);
  }, []);

  const closeConnectPlace = useCallback(() => setIsOpen(false), []);

  const getClaim = useCallback(
    (claimId: string) => claims.find((claim) => claim.id === claimId),
    [claims],
  );

  const getClaimForPlace = useCallback(
    (placeId: string) =>
      claims.find(
        (claim) =>
          claim.status !== 'cancelled' && claim.places.some((place) => place.id === placeId),
      ),
    [claims],
  );

  const submitClaim = useCallback(
    (input: SubmitClaimInput): Claim => {
      const claim: Claim = {
        id: makeId('claim'),
        communityId: input.communityId,
        communityName: input.communityName,
        communityPhoto: input.communityPhoto,
        places: input.places,
        documents: input.documents,
        notes: input.notes,
        status: 'review' as ClaimStatus,
        sentAt: new Date().toISOString(),
      };

      dispatch(addClaim(claim));
      refreshClaims();
      return claim;
    },
    [dispatch, refreshClaims],
  );

  const resubmitDocuments = useCallback(
    (claimId: string, documents: ClaimDocument[], notes?: string) => {
      dispatch(resubmitClaimDocuments({ claimId, documents, notes }));
      refreshClaims();
    },
    [dispatch, refreshClaims],
  );

  const cancelClaim = useCallback(
    (claimId: string) => {
      dispatch(cancelClaimAction(claimId));
      refreshClaims();
    },
    [dispatch, refreshClaims],
  );

  const value = useMemo(
    () => ({
      isOpen,
      options,
      openConnectPlace,
      closeConnectPlace,
      claims,
      getClaimForPlace,
      getClaim,
      submitClaim,
      resubmitDocuments,
      cancelClaim,
    }),
    [
      isOpen,
      options,
      openConnectPlace,
      closeConnectPlace,
      claims,
      getClaimForPlace,
      getClaim,
      submitClaim,
      resubmitDocuments,
      cancelClaim,
    ],
  );

  return (
    <ConnectPlaceDrawerContext.Provider value={value}>
      {children}
      {/* Reads everything it needs (isOpen, options, the sent claims) back off
          this same context, rather than through props - it is always rendered
          inside this provider. */}
      <ConnectPlaceDrawer />
    </ConnectPlaceDrawerContext.Provider>
  );
};

/**
 * Returns null outside the provider rather than throwing, so a component
 * (e.g. ClaimCard) can render in a test, or on a screen with no drawer,
 * without one.
 */
export const useConnectPlaceDrawer = (): ConnectPlaceDrawerValue | null =>
  useContext(ConnectPlaceDrawerContext);
