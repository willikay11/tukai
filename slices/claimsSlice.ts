import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Claim, ClaimDocument, ClaimStatus } from '@/types/claim';

/**
 * The claims this browser has sent - which places and community went
 * together, and the documents behind each one.
 *
 * The API has no claim record that groups several places under one set of
 * documents (see types/claim.ts), so this is the only record of a claim
 * until Tukai decides it and place ownership becomes checkable through the
 * real ownership endpoint. Persisted through redux-persist (store/store.ts)
 * so a claim is still there after a reload - without that, sending a claim
 * and then refreshing the page read as "nobody has claimed this place".
 */
type ClaimsState = { claims: Claim[] };

const initialState: ClaimsState = { claims: [] };

const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    addClaim: (state, action: PayloadAction<Claim>) => {
      state.claims.push(action.payload);
    },
    resubmitClaimDocuments: (
      state,
      action: PayloadAction<{ claimId: string; documents: ClaimDocument[]; notes?: string }>,
    ) => {
      const claim = state.claims.find((entry) => entry.id === action.payload.claimId);
      if (!claim) return;
      claim.documents = action.payload.documents;
      claim.notes = action.payload.notes ?? claim.notes;
      claim.status = 'review' as ClaimStatus;
    },
    cancelClaim: (state, action: PayloadAction<string>) => {
      const claim = state.claims.find((entry) => entry.id === action.payload);
      if (claim) claim.status = 'cancelled' as ClaimStatus;
    },
  },
});

export const { addClaim, resubmitClaimDocuments, cancelClaim } = claimsSlice.actions;
export const claimsReducer = claimsSlice.reducer;
