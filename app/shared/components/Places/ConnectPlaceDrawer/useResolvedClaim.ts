import { useMemo } from 'react';

import { useVerificationDocuments } from '@/app/shared/hooks/useCommunities';
import { usePlaceOwnerships } from '@/app/shared/hooks/usePlaces';
import { Claim, ClaimDocument, ClaimStatus } from '@/types/claim';
import { Community } from '@/types/community';

type OwnershipState = { exists: boolean; approved: boolean } | null;

type VerificationDocumentRow = {
  id: string;
  documentType: string;
  fileUrl?: string | null;
  notes?: string;
};

export const fileNameFromUrl = (url?: string | null): string => {
  const last = url?.split('?')[0].split('/').pop();
  return last ? decodeURIComponent(last) : 'Document';
};

const documentRows = (response: { data?: unknown } | undefined): VerificationDocumentRow[] => {
  const data = response?.data as
    | VerificationDocumentRow[]
    | { results?: VerificationDocumentRow[] };
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
};

export const claimStatusFrom = ({
  sentStatus,
  ownerships,
  verificationStatus,
}: {
  sentStatus: ClaimStatus;
  ownerships: OwnershipState[];
  verificationStatus: Community['verificationStatus'];
}): ClaimStatus => {
  if (sentStatus === 'cancelled') return 'cancelled';

  const answered = ownerships.every((ownership) => ownership !== null);
  if (answered && ownerships.length > 0) {
    const held = ownerships.filter((ownership) => ownership?.exists);
    if (held.length === 0) return 'cancelled';
    if (held.every((ownership) => ownership?.approved)) return 'approved';
  }

  return verificationStatus === 'rejected' ? 'rejected' : 'review';
};

export const useResolvedClaim = (
  sent: Claim | undefined,
  communities: Community[],
  enabled: boolean,
): Claim | undefined => {
  const placeIds = useMemo(() => sent?.places.map((place) => place.id) ?? [], [sent]);
  const ownershipQueries = usePlaceOwnerships(placeIds, enabled && Boolean(sent));
  const { data: documentsResponse } = useVerificationDocuments(
    sent?.communityId ?? '',
    enabled && Boolean(sent),
  );

  const ownershipKey = ownershipQueries
    .map((query) =>
      query.data ? `${query.data.data ? 'held' : 'none'}:${query.data.data?.approved}` : 'pending',
    )
    .join('|');

  return useMemo(() => {
    if (!sent) return undefined;

    const ownerships: OwnershipState[] = ownershipQueries.map((query) =>
      query.data
        ? { exists: Boolean(query.data.data), approved: Boolean(query.data.data?.approved) }
        : null,
    );
    const community = communities.find((entry) => entry.id === sent.communityId);

    const rows = documentsResponse ? documentRows(documentsResponse) : null;
    const documents: ClaimDocument[] = rows
      ? rows.map((row) => {
          const sentInSession = sent.documents.find(
            (document) => document.documentType === row.documentType,
          );
          return {
            id: row.id,
            documentType: row.documentType,
            fileName: sentInSession?.fileName ?? fileNameFromUrl(row.fileUrl),
            fileSizeLabel: sentInSession?.fileSizeLabel,
          };
        })
      : sent.documents;

    return {
      ...sent,
      status: claimStatusFrom({
        sentStatus: sent.status,
        ownerships,
        verificationStatus: community?.verificationStatus,
      }),
      documents,
      notes: rows?.find((row) => row.notes)?.notes ?? sent.notes,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ownershipKey stands in for the queries array, new every render
  }, [sent, communities, documentsResponse, ownershipKey]);
};
