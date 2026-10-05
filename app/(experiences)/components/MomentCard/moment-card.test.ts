import { Moment } from '@/types/moment';

import { momentCaption, momentDate } from './moment-card';

const moment = (overrides: Partial<Moment> = {}): Moment =>
  ({
    id: 'm1',
    title: 'First bowl',
    description: 'First bowl off the wheel. Slightly wonky, very pleased with it.',
    ...overrides,
  }) as unknown as Moment;

describe('momentCaption', () => {
  it('is the description', () => {
    expect(momentCaption(moment())).toBe(
      'First bowl off the wheel. Slightly wonky, very pleased with it.',
    );
  });

  // A moment can be posted with only a title, and still has something to show
  it('falls back to the title', () => {
    expect(momentCaption(moment({ description: '' }))).toBe('First bowl');
    expect(momentCaption(moment({ description: '   ' }))).toBe('First bowl');
  });

  it('is empty when there are no words at all', () => {
    expect(momentCaption(moment({ title: '', description: '' }))).toBe('');
  });
});

describe('momentDate', () => {
  it('is the compact day and month the byline uses', () => {
    expect(momentDate('2026-10-02T09:00:00Z')).toBe('2 Oct');
  });

  it('is empty for a date that cannot be read', () => {
    expect(momentDate('not a date')).toBe('');
  });
});
