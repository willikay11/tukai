import { Experience } from '@/types/experience';

import { InviteChip, emptyLine, guestChip, matchesQuery } from './guest-list';

const guest = (email: string): Experience['guests'][number] => ({
  id: 'g1',
  email,
  dateCreated: '2026-09-01T00:00:00Z',
  status: 'invited',
});

/**
 * A guest is only ever an email and a status on the API - no name, no avatar -
 * so the chip has to be built out of the address.
 */
describe('guestChip', () => {
  it('shows the address as the label', () => {
    expect(guestChip(guest('amani.w@gmail.com')).label).toBe('amani.w@gmail.com');
  });

  // The canvas marks an address with an @ rather than a first letter
  it('marks an address with an @', () => {
    expect(guestChip(guest('amani.w@gmail.com')).initial).toBe('@');
  });

  it('falls back to a letter when there is no @', () => {
    expect(guestChip(guest('amani')).initial).toBe('A');
  });

  it('names the guest in the remove label', () => {
    expect(guestChip(guest('amani.w@gmail.com')).removeLabel).toBe('amani.w@gmail.com');
  });
});

describe('matchesQuery', () => {
  const chip: InviteChip = {
    id: 'c1',
    label: 'Nairobi Hikers',
    initial: 'N',
    removeLabel: 'Nairobi Hikers',
  };

  it('keeps everything when nothing is typed', () => {
    expect(matchesQuery(chip, '')).toBe(true);
    expect(matchesQuery(chip, '   ')).toBe(true);
  });

  it('matches part of the label, whatever the case', () => {
    expect(matchesQuery(chip, 'hik')).toBe(true);
    expect(matchesQuery(chip, 'NAIROBI')).toBe(true);
  });

  it('drops what does not match', () => {
    expect(matchesQuery(chip, 'mombasa')).toBe(false);
  });
});

describe('emptyLine', () => {
  it('blames the search when one is typed', () => {
    expect(emptyLine('guests', 'zz')).toBe('No one matches that search.');
    expect(emptyLine('communities', 'zz')).toBe('No one matches that search.');
  });

  it('says which list is empty otherwise', () => {
    expect(emptyLine('guests', '')).toBe('No guests invited yet.');
    expect(emptyLine('communities', '')).toBe('No communities invited yet.');
  });
});
