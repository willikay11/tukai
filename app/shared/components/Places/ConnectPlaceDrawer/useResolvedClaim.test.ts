import { claimStatusFrom, fileNameFromUrl } from './useResolvedClaim';

const held = (approved: boolean) => ({ exists: true, approved });
const none = { exists: false, approved: false };

describe('claimStatusFrom', () => {
  const status = (
    ownerships: Parameters<typeof claimStatusFrom>[0]['ownerships'],
    verificationStatus: Parameters<typeof claimStatusFrom>[0]['verificationStatus'] = null,
    sentStatus: Parameters<typeof claimStatusFrom>[0]['sentStatus'] = 'review',
  ) => claimStatusFrom({ sentStatus, ownerships, verificationStatus });

  it('is under review while the claims wait for Tukai', () => {
    expect(status([held(false)], 'pending')).toBe('review');
    expect(status([held(false), held(false)], 'under_review')).toBe('review');
  });

  it('is under review until every place has answered', () => {
    expect(status([null])).toBe('review');
    expect(status([held(true), null])).toBe('review');
  });

  it('is approved once every place the claim holds is approved', () => {
    expect(status([held(true)], 'approved')).toBe('approved');
    expect(status([held(true), held(true)], 'approved')).toBe('approved');
  });

  it('is not approved while any one place is still waiting', () => {
    expect(status([held(true), held(false)], 'approved')).toBe('review');
  });

  it('ignores a place that was withdrawn when the rest are approved', () => {
    expect(status([held(true), none], 'approved')).toBe('approved');
  });

  it('is rejected when the verification was rejected and nothing is approved', () => {
    expect(status([held(false)], 'rejected')).toBe('rejected');
  });

  it('is approved, not rejected, when the places were approved after an earlier rejection', () => {
    expect(status([held(true)], 'rejected')).toBe('approved');
  });

  it('is cancelled when no place carries a claim any more', () => {
    expect(status([none])).toBe('cancelled');
    expect(status([none, none], 'rejected')).toBe('cancelled');
  });

  it('stays cancelled once the owner cancelled it, whatever the API says', () => {
    expect(status([held(false)], 'pending', 'cancelled')).toBe('cancelled');
  });

  it('never reads a claim with no places as cancelled', () => {
    expect(status([])).toBe('review');
  });
});

describe('fileNameFromUrl', () => {
  it('takes the file from the end of the url, without its query or encoding', () => {
    expect(
      fileNameFromUrl('https://cdn.tukai.co/verification_documents/pin%20certificate.pdf?sig=1'),
    ).toBe('pin certificate.pdf');
  });

  it('falls back to Document when there is no url', () => {
    expect(fileNameFromUrl(undefined)).toBe('Document');
    expect(fileNameFromUrl(null)).toBe('Document');
    expect(fileNameFromUrl('')).toBe('Document');
  });
});
