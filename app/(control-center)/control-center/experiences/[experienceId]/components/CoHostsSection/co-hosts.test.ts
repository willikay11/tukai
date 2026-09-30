import { matchUserByEmail } from './co-hosts';

const rows = [
  { id: 'u1', email: 'kevo@habari.co.ke', displayName: 'Kevo' },
  { id: 'u2', email: 'kevo.mwangi@habari.co.ke', displayName: 'Kevin' },
];

/**
 * A co-host is added by id, and the only lookup is by email — so the address
 * has to resolve to exactly one account before anyone is invited.
 */
describe('matchUserByEmail', () => {
  it('reads a paginated answer', () => {
    expect(matchUserByEmail({ results: rows }, 'kevo@habari.co.ke')?.id).toBe('u1');
  });

  it('reads a bare list too', () => {
    expect(matchUserByEmail(rows, 'kevo@habari.co.ke')?.id).toBe('u1');
  });

  // The endpoint matches loosely, so a prefix must not win over the address typed
  it('prefers the exact address over a near one', () => {
    expect(matchUserByEmail({ results: rows }, 'KEVO@HABARI.CO.KE')?.id).toBe('u1');
  });

  it('takes a single result as the person', () => {
    expect(matchUserByEmail({ results: [rows[1]] }, 'kevo@habari.co.ke')?.id).toBe('u2');
  });

  it('has no answer when several match and none exactly', () => {
    expect(matchUserByEmail({ results: rows }, 'kev@habari.co.ke')).toBeUndefined();
  });

  it('has no answer when nothing comes back', () => {
    expect(matchUserByEmail({ results: [] }, 'kevo@habari.co.ke')).toBeUndefined();
    expect(matchUserByEmail(null, 'kevo@habari.co.ke')).toBeUndefined();
  });
});
