import {
  MyProfile,
  interestName,
  profileCount,
  profileHandle,
  profileName,
  profileSocials,
} from './profile';

const profile = (overrides: Partial<MyProfile> = {}): MyProfile =>
  ({ id: 'u1', firstName: 'Wanjiku', lastName: 'Maina', ...overrides }) as MyProfile;

/** The counts come back as strings on this serializer. */
describe('profileCount', () => {
  it('reads a count sent as a string', () => {
    expect(profileCount('128')).toBe(128);
  });

  it('takes a number as it is', () => {
    expect(profileCount(12)).toBe(12);
  });

  it.each([[''], [null], [undefined], ['lots']])('reads %s as none', (value) => {
    expect(profileCount(value as string)).toBe(0);
  });
});

describe('profileHandle', () => {
  it('puts the @ on, since the API stores it without', () => {
    expect(profileHandle(profile({ displayName: 'wanjiku.m' }))).toBe('@wanjiku.m');
  });

  it('has no handle where none was set', () => {
    expect(profileHandle(profile())).toBeNull();
    expect(profileHandle(profile({ displayName: '   ' }))).toBeNull();
    expect(profileHandle(undefined)).toBeNull();
  });
});

/**
 * A row of five greyed icons says nothing; only the links a reader actually set
 * are worth showing.
 */
describe('profileSocials', () => {
  it('keeps only the links that were set', () => {
    const socials = profileSocials(
      profile({ instagramUrl: 'https://instagram.com/x', xUrl: '   ', websiteUrl: null }),
    );

    expect(socials.map((one) => one.label)).toEqual(['Instagram']);
  });

  it('keeps them in the canvas order', () => {
    const socials = profileSocials(
      profile({
        xUrl: 'https://x.com/x',
        websiteUrl: 'https://example.com',
        instagramUrl: 'https://instagram.com/x',
      }),
    );

    expect(socials.map((one) => one.label)).toEqual(['Website', 'Instagram', 'X']);
  });

  it('has nothing to show without a profile', () => {
    expect(profileSocials(undefined)).toEqual([]);
  });
});

describe('interestName', () => {
  // The API names an interest with either field depending on the endpoint
  it('reads whichever field carries the name', () => {
    expect(interestName({ name: 'Hiking' })).toBe('Hiking');
    expect(interestName({ title: 'Hiking' })).toBe('Hiking');
    expect(interestName({})).toBe('Interest');
  });
});

/**
 * The handle has its own line on this page, so using it for the heading as
 * well printed it twice and lost the reader's actual name.
 */
describe('profileName', () => {
  it('is the first and last name together', () => {
    expect(profileName(profile({ displayName: 'wanjiku.m' }))).toBe('Wanjiku Maina');
  });

  it('falls back to the handle where there is no name', () => {
    expect(profileName(profile({ firstName: '', lastName: '', displayName: 'wanjiku.m' }))).toBe(
      'wanjiku.m',
    );
  });

  it('takes the fallback the caller gave where there is neither', () => {
    expect(profileName(undefined, 'You')).toBe('You');
  });
});
