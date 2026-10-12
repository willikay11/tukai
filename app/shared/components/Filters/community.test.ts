import { Experience } from '@/types/experience';

import { matchesYourCommunities } from './community';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    hostCommunity: { id: 'c1', title: 'Nairobi Hikers' },
    ...overrides,
  }) as unknown as Experience;

describe('matchesYourCommunities', () => {
  it('keeps everything when the toggle is off', () => {
    expect(matchesYourCommunities(experience(), false, [])).toBe(true);
  });

  it('keeps a row hosted by a followed community', () => {
    expect(matchesYourCommunities(experience(), true, ['c1', 'c2'])).toBe(true);
  });

  it('drops a row hosted by a community the reader does not follow', () => {
    expect(matchesYourCommunities(experience(), true, ['c2'])).toBe(false);
  });

  it('drops a row with no host community', () => {
    expect(matchesYourCommunities(experience({ hostCommunity: undefined }), true, ['c1'])).toBe(
      false,
    );
  });
});
