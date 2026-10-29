import { placeDrawerTabs } from './tabs';

const labels = (...args: Parameters<typeof placeDrawerTabs>) =>
  placeDrawerTabs(...args).map((tab) => tab.label);

describe('placeDrawerTabs', () => {
  it('starts with About, then Moments and Reviews', () => {
    expect(labels(null, false)).toEqual(['About', 'Moments', 'Reviews']);
  });

  it('puts Reservations right after About for a manager', () => {
    expect(labels(null, true, true)).toEqual([
      'About',
      'Reservations',
      'Experiences',
      'Moments',
      'Reviews',
    ]);
  });

  it('points Reservations at its own section', () => {
    const tab = placeDrawerTabs(null, false, true).find((entry) => entry.label === 'Reservations');

    expect(tab?.id).toBe('place-reservations');
    expect(tab?.icon).toBe('CalendarCheckIn01Icon');
  });

  it('counts the reviews in the Reviews tab', () => {
    expect(labels(1234, false)).toContain('Reviews (1,234)');
  });
});
