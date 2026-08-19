import moment from 'moment';

import { SEE_ALL_CONFIG, type SeeAllContext, isSeeAllType } from './config';

const context: SeeAllContext = { city: 'Lamu', lat: -1.29, lng: 36.82 };

describe('isSeeAllType', () => {
  it('accepts every configured section', () => {
    expect(isSeeAllType('today')).toBe(true);
    expect(isSeeAllType('near-me')).toBe(true);
    expect(isSeeAllType('city')).toBe(true);
  });

  it('rejects unknown or missing types', () => {
    expect(isSeeAllType('nonsense')).toBe(false);
    expect(isSeeAllType(undefined)).toBe(false);
  });
});

describe('SEE_ALL_CONFIG titles', () => {
  it('uses the context city where the section names one', () => {
    expect(SEE_ALL_CONFIG.city.title(context)).toBe('Experiences in Lamu');
    expect(SEE_ALL_CONFIG.tomorrow.title(context)).toBe('Happening Tomorrow in Lamu');
  });

  it('leaves city out of the city-agnostic sections', () => {
    expect(SEE_ALL_CONFIG.today.title(context)).toBe('Happening Today');
    expect(SEE_ALL_CONFIG['near-me'].title(context)).toBe('Happening Near You');
  });
});

describe('SEE_ALL_CONFIG subtitles', () => {
  it('appends the API total and pluralises it', () => {
    expect(SEE_ALL_CONFIG.city.subtitle(context, 6)).toBe('6 results');
    expect(SEE_ALL_CONFIG.city.subtitle(context, 1)).toBe('1 result');
    expect(SEE_ALL_CONFIG.city.subtitle(context, 0)).toBe('0 results');
  });

  it('omits the count until the first response lands', () => {
    expect(SEE_ALL_CONFIG.city.subtitle(context, null)).toBe('');
    expect(SEE_ALL_CONFIG['near-me'].subtitle(context, null)).toBe('Within 25 km of Lamu');
  });

  it('prefixes the date for the day-scoped sections', () => {
    expect(SEE_ALL_CONFIG.today.subtitle(context, 6)).toMatch(/^\w+day, \d+\w{2} \w+ · 6 results$/);
    expect(SEE_ALL_CONFIG['near-me'].subtitle(context, 6)).toBe('Within 25 km of Lamu · 6 results');
  });
});

describe('SEE_ALL_CONFIG queries', () => {
  it('resolves today and tomorrow to real dates', () => {
    expect(SEE_ALL_CONFIG.today.query(context)).toEqual({ date: moment().format('YYYY-MM-DD') });
    expect(SEE_ALL_CONFIG.tomorrow.query(context)).toEqual({
      date: moment().add(1, 'days').format('YYYY-MM-DD'),
    });
  });

  it('scopes near-me by coordinates only — there is no radius param', () => {
    expect(SEE_ALL_CONFIG['near-me'].query(context)).toEqual({
      status: 'published',
      lat: -1.29,
      long: 36.82,
    });
  });

  it('falls back to free-text search for city, which has no filter', () => {
    expect(SEE_ALL_CONFIG.city.query(context)).toEqual({ search: 'Lamu' });
  });
});
