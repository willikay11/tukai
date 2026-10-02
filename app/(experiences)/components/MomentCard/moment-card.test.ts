import { Moment } from '@/types/moment';

import {
  PREVIEW_LENGTH,
  momentByline,
  momentCaption,
  momentDate,
  momentPreview,
} from './moment-card';

const moment = (overrides: Partial<Moment> = {}): Moment =>
  ({
    id: 'm1',
    title: 'First bowl',
    description: 'First bowl off the wheel. Slightly wonky, very pleased with it.',
    author: { id: 'u1', firstName: 'Amina', lastName: 'Njeri', displayName: null },
    dateCreated: '2026-10-02T09:00:00Z',
    media: [],
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

describe('momentPreview', () => {
  it('leaves a short caption alone', () => {
    expect(momentPreview(moment({ description: 'Two hours, no phones.' }))).toBe(
      'Two hours, no phones.',
    );
  });

  it('cuts a long one to a card’s worth', () => {
    const long = 'a'.repeat(200);
    const preview = momentPreview(moment({ description: long }));

    expect(preview).toBe(`${'a'.repeat(PREVIEW_LENGTH)}...`);
  });

  it('does not cut one that is exactly the limit', () => {
    const exact = 'b'.repeat(PREVIEW_LENGTH);

    expect(momentPreview(moment({ description: exact }))).toBe(exact);
  });
});

describe('momentDate', () => {
  it('is the compact day and month the canvas uses', () => {
    expect(momentDate('2026-10-02T09:00:00Z')).toBe('2 Oct');
  });

  it('is empty for a date that cannot be read', () => {
    expect(momentDate('not a date')).toBe('');
  });
});

describe('momentByline', () => {
  it('is the author and the date', () => {
    expect(momentByline(moment())).toBe('Amina Njeri · 2 Oct');
  });

  it('prefers a display name', () => {
    expect(momentByline(moment({ author: { ...moment().author, displayName: 'Amina' } }))).toBe(
      'Amina · 2 Oct',
    );
  });

  // Rather than a stray separator
  it('is the name alone when the date cannot be read', () => {
    expect(momentByline(moment({ dateCreated: 'whenever' }))).toBe('Amina Njeri');
  });
});
