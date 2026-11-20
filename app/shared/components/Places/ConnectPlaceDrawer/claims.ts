import moment from 'moment';

import { Claim, ClaimDocument, ClaimStatus, PlaceClaimRow } from '@/types/claim';
import { coverPhotoUrl } from '@/types/photo';

export const fileNameFromUrl = (url?: string | null): string => {
  const last = url?.split('?')[0].split('/').pop();
  return last ? decodeURIComponent(last) : 'Document';
};

/**
 * A claim's status from its places' rows: approved once every place is,
 * not approved once Tukai turned it down (every place, or the community's
 * verification), else under review.
 */
export const claimStatusFromRows = (rows: PlaceClaimRow[]): ClaimStatus => {
  if (rows.length > 0 && rows.every((row) => row.status === 'approved')) return 'approved';
  if (
    (rows.length > 0 && rows.every((row) => row.status === 'rejected')) ||
    rows.some((row) => row.verificationStatus === 'rejected')
  ) {
    return 'rejected';
  }
  return 'review';
};

const decidedAtOf = (rows: PlaceClaimRow[], status: ClaimStatus): string | null => {
  if (status !== 'approved' && status !== 'rejected') return null;
  const dates = rows.map((row) => row.decidedAt).filter((date): date is string => Boolean(date));
  return dates.sort().at(-1) ?? null;
};

const documentsOf = (rows: PlaceClaimRow[], sent?: Claim): ClaimDocument[] | null => {
  const withDocuments = rows.find((row) => row.documents.length > 0);
  if (!withDocuments) return null;
  return withDocuments.documents.map((document) => {
    // A document sent from this browser keeps its own file name and size
    const fromHere = sent?.documents.find((entry) => entry.documentType === document.documentType);
    return {
      id: document.id,
      documentType: document.documentType,
      fileName: fromHere?.fileName ?? fileNameFromUrl(document.fileUrl),
      fileSizeLabel: fromHere?.fileSizeLabel,
    };
  });
};

const notesOf = (rows: PlaceClaimRow[]) =>
  rows.flatMap((row) => row.documents).find((document) => document.notes)?.notes || undefined;

/**
 * The person's claims: the ones this browser sent, with what the server says
 * of each - status, when it was decided, documents - and the ones the server
 * has that this browser never saw, from another device (DEV-391/427).
 *
 * The server lists a claim per place; this browser remembers which places
 * went in together, so its claims keep their grouping. Rows it doesn't know
 * are grouped by community and the day they were made. `listedAt` is when
 * the server's list was read: a claim sent before then whose places are all
 * gone from it was cancelled; one sent since just isn't listed yet.
 */
export const mergeClaims = ({
  sent,
  rows,
  listedAt,
}: {
  sent: Claim[];
  rows: PlaceClaimRow[] | null;
  listedAt: number;
}): Claim[] => {
  if (!rows) return sent;

  const used = new Set<string>();
  const fromHere = sent.map((claim): Claim => {
    const placeIds = new Set(claim.places.map((place) => place.id));
    const mine = rows.filter(
      (row) => row.community.id === claim.communityId && placeIds.has(row.place.id),
    );
    mine.forEach((row) => used.add(row.id));

    if (claim.status === 'cancelled') return claim;
    if (mine.length === 0) {
      const isListedSince = listedAt >= new Date(claim.sentAt).getTime();
      return isListedSince ? { ...claim, status: 'cancelled' } : claim;
    }

    const status = claimStatusFromRows(mine);
    return {
      ...claim,
      status,
      decidedAt: decidedAtOf(mine, status),
      documents: documentsOf(mine, claim) ?? claim.documents,
      notes: notesOf(mine) ?? claim.notes,
    };
  });

  const groups = new Map<string, PlaceClaimRow[]>();
  for (const row of rows) {
    if (used.has(row.id)) continue;
    const key = `${row.community.id}:${moment(row.dateCreated).format('YYYYMMDD')}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const fromElsewhere = Array.from(groups.entries()).map(([key, group]): Claim => {
    const status = claimStatusFromRows(group);
    const first = group[0];
    return {
      id: `server:${key}`,
      communityId: first.community.id,
      communityName: first.community.title,
      places: group.map((row) => ({
        id: row.place.id,
        title: row.place.title,
        slug: row.place.slug,
        locality: row.place.location?.city ?? row.place.location?.name ?? undefined,
        photo: coverPhotoUrl(row.place.photos as never, 'thumb'),
        isOnTukai: true,
      })),
      documents: documentsOf(group) ?? [],
      notes: notesOf(group),
      status,
      sentAt: group.map((row) => row.dateCreated).sort()[0],
      decidedAt: decidedAtOf(group, status),
    };
  });

  return [...fromHere, ...fromElsewhere].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  );
};
