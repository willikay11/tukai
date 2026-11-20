import { Claim, PlaceClaimRow } from '@/types/claim';

import { claimStatusFromRows, fileNameFromUrl, mergeClaims } from './claims';

const SENT_AT = '2026-11-10T09:00:00Z';
const LATER = new Date('2026-11-12T09:00:00Z').getTime();

const sent = (extra: Partial<Claim> = {}): Claim => ({
  id: 'claim-1',
  communityId: 'c1',
  communityName: 'Weekend Readers',
  places: [
    { id: 'pl1', title: 'Karura', isOnTukai: true },
    { id: 'pl2', title: 'Arboretum', isOnTukai: true },
  ],
  documents: [
    { id: 'd', documentType: 'business_license', fileName: 'licence.pdf', fileSizeLabel: '2 KB' },
  ],
  status: 'review',
  sentAt: SENT_AT,
  ...extra,
});

const row = (extra: Partial<PlaceClaimRow> = {}): PlaceClaimRow => ({
  id: 'own-1',
  place: { id: 'pl1', title: 'Karura', slug: 'karura', location: { city: 'Gigiri' }, photos: [] },
  community: { id: 'c1', title: 'Weekend Readers' },
  status: 'pending',
  decidedAt: null,
  verificationStatus: 'under_review',
  documents: [],
  dateCreated: SENT_AT,
  ...extra,
});

// DEV-391/427: claims from the server, kept grouped as this browser sent them
describe('mergeClaims', () => {
  it('keeps this browser’s claims as they are until the server list is read', () => {
    expect(mergeClaims({ sent: [sent()], rows: null, listedAt: 0 })).toEqual([sent()]);
  });

  it('takes the status and decided date from the claim’s rows, kept together', () => {
    const [claim] = mergeClaims({
      sent: [sent()],
      rows: [
        row({ id: 'o1', status: 'approved', decidedAt: '2026-11-11T08:00:00Z' }),
        row({
          id: 'o2',
          place: { id: 'pl2', title: 'Arboretum' },
          status: 'approved',
          decidedAt: '2026-11-11T09:30:00Z',
        }),
      ],
      listedAt: LATER,
    });

    expect(claim.id).toBe('claim-1');
    expect(claim.places).toHaveLength(2);
    expect(claim.status).toBe('approved');
    expect(claim.decidedAt).toBe('2026-11-11T09:30:00Z');
  });

  it('is under review until every place is approved', () => {
    const [claim] = mergeClaims({
      sent: [sent()],
      rows: [
        row({ id: 'o1', status: 'approved' }),
        row({ id: 'o2', place: { id: 'pl2', title: 'A' } }),
      ],
      listedAt: LATER,
    });

    expect(claim.status).toBe('review');
    expect(claim.decidedAt).toBeNull();
  });

  it('is not approved once the community’s verification is turned down', () => {
    expect(claimStatusFromRows([row({ verificationStatus: 'rejected' })])).toBe('rejected');
    expect(claimStatusFromRows([row({ status: 'rejected' })])).toBe('rejected');
  });

  it('is cancelled once the server, read after it was sent, lists none of its places', () => {
    expect(mergeClaims({ sent: [sent()], rows: [], listedAt: LATER })[0].status).toBe('cancelled');
  });

  it('is not cancelled by a list read before it was sent', () => {
    const before = new Date('2026-11-09T09:00:00Z').getTime();
    expect(mergeClaims({ sent: [sent()], rows: [], listedAt: before })[0].status).toBe('review');
  });

  it('names the server’s documents by their file, keeping the size of one sent from here', () => {
    const [claim] = mergeClaims({
      sent: [sent()],
      rows: [
        row({
          documents: [
            {
              id: 'srv-1',
              documentType: 'business_license',
              fileUrl: 'https://cdn/x/licence.pdf',
              notes: '',
              dateCreated: SENT_AT,
            },
            {
              id: 'srv-2',
              documentType: 'tax_registration',
              fileUrl: 'https://cdn/x/pin%20cert.pdf?sig=1',
              notes: 'Since 2019',
              dateCreated: SENT_AT,
            },
          ],
        }),
      ],
      listedAt: LATER,
    });

    expect(claim.documents).toEqual([
      {
        id: 'srv-1',
        documentType: 'business_license',
        fileName: 'licence.pdf',
        fileSizeLabel: '2 KB',
      },
      {
        id: 'srv-2',
        documentType: 'tax_registration',
        fileName: 'pin cert.pdf',
        fileSizeLabel: undefined,
      },
    ]);
    expect(claim.notes).toBe('Since 2019');
  });

  it('adds claims made on another device, a claim per community and day', () => {
    const claims = mergeClaims({
      sent: [],
      rows: [
        row({ id: 'o1', dateCreated: '2026-11-15T09:00:00' }),
        row({
          id: 'o2',
          place: { id: 'pl2', title: 'Arboretum' },
          dateCreated: '2026-11-15T09:01:00',
        }),
        row({
          id: 'o3',
          place: { id: 'pl3', title: 'City Park' },
          community: { id: 'c2', title: 'Park Friends' },
          status: 'rejected',
          decidedAt: '2026-11-16T10:00:00Z',
          dateCreated: '2026-11-14T09:00:00',
        }),
      ],
      listedAt: LATER,
    });

    expect(
      claims.map((claim) => [claim.communityName, claim.places.map((p) => p.title), claim.status]),
    ).toEqual([
      ['Weekend Readers', ['Karura', 'Arboretum'], 'review'],
      ['Park Friends', ['City Park'], 'rejected'],
    ]);
    expect(claims[0].places[0].locality).toBe('Gigiri');
    expect(claims[1].decidedAt).toBe('2026-11-16T10:00:00Z');
  });

  it('keeps a claim cancelled here cancelled', () => {
    const [claim] = mergeClaims({
      sent: [sent({ status: 'cancelled' })],
      rows: [row()],
      listedAt: LATER,
    });

    expect(claim.status).toBe('cancelled');
  });
});

describe('fileNameFromUrl', () => {
  it('reads the file name, decoded, without the query', () => {
    expect(fileNameFromUrl('https://cdn/a/b%20c.pdf?sig=1')).toBe('b c.pdf');
    expect(fileNameFromUrl(null)).toBe('Document');
  });
});
