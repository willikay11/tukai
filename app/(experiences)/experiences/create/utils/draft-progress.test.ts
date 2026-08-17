import { Experience } from '@/types/experience';

import { buildDraftSteps, getLastSavedAt, pickLatestDraft, selectDrafts } from './draft-progress';

const draft = (overrides: Partial<Experience> = {}) =>
  ({
    id: 'draft-1',
    title: 'Mt Kenya Summit Trek',
    description: 'A long trek',
    location: { city: 'Nairobi' },
    photos: [{ id: 'p1', photo: 'a.jpg' }],
    tickets: [],
    guests: [],
    startDate: '2026-05-16T07:30:00Z',
    endDate: '2026-05-16T16:30:00Z',
    dateCreated: '2026-08-01T10:00:00Z',
    ...overrides,
  }) as unknown as Experience;

describe('buildDraftSteps', () => {
  it('omits wallet — completion belongs to the user, not the draft', () => {
    const ids = buildDraftSteps(draft()).map((step) => step.id);

    expect(ids).not.toContain('wallet');
    expect(ids).toEqual(['dates-type', 'about', 'tickets', 'guests', 'preview']);
  });

  it('adds the itinerary step for itinerary experiences', () => {
    const ids = buildDraftSteps(draft({ experienceType: 'itinerary' })).map((step) => step.id);

    expect(ids).toContain('itinerary-days');
    expect(ids).toHaveLength(6);
  });

  it('marks a filled About step done and the first gap current', () => {
    const steps = buildDraftSteps(draft());
    const byId = Object.fromEntries(steps.map((step) => [step.id, step.state]));

    expect(byId['dates-type']).toBe('done');
    expect(byId.about).toBe('done');
    // No tickets yet — this is where the creator left off
    expect(byId['tickets']).toBe('current');
    expect(byId.guests).toBe('pending');
    expect(byId.preview).toBe('pending');
  });

  it('does not count About as done when a required field is missing', () => {
    const steps = buildDraftSteps(draft({ photos: [] }));
    const about = steps.find((step) => step.id === 'about');

    expect(about?.state).toBe('current');
  });

  it('marks every step done when the draft is complete', () => {
    const steps = buildDraftSteps(
      draft({
        tickets: [{ id: 't1' }] as never,
        guests: [{ id: 'g1' }] as never,
      }),
    );

    expect(steps.every((step) => step.state === 'done')).toBe(true);
  });
});

describe('selectDrafts', () => {
  it('keeps only drafts, matching the API’s lowercase status', () => {
    const experiences = [
      draft({ id: 'a', status: 'draft' as never }),
      draft({ id: 'b', status: 'published' as never }),
      draft({ id: 'c', status: 'cancelled' as never }),
      draft({ id: 'd', status: 'DRAFT' as never }),
    ];

    expect(selectDrafts(experiences).map((item) => item.id)).toEqual(['a', 'd']);
  });

  it('returns nothing when the creator has no drafts', () => {
    expect(selectDrafts([draft({ status: 'published' as never })])).toEqual([]);
  });
});

describe('pickLatestDraft', () => {
  it('returns null with no drafts', () => {
    expect(pickLatestDraft([])).toBeNull();
  });

  it('prefers the most recently updated draft', () => {
    const older = draft({ id: 'older', dateUpdated: '2026-08-01T10:00:00Z' });
    const newer = draft({ id: 'newer', dateUpdated: '2026-08-09T10:00:00Z' });

    expect(pickLatestDraft([older, newer])?.id).toBe('newer');
    expect(pickLatestDraft([newer, older])?.id).toBe('newer');
  });

  it('falls back to creation time when the API omits dateUpdated', () => {
    const older = draft({ id: 'older', dateCreated: '2026-08-01T10:00:00Z' });
    const newer = draft({ id: 'newer', dateCreated: '2026-08-09T10:00:00Z' });

    expect(pickLatestDraft([older, newer])?.id).toBe('newer');
  });
});

describe('getLastSavedAt', () => {
  it('prefers dateUpdated and falls back to dateCreated', () => {
    expect(getLastSavedAt(draft({ dateUpdated: '2026-08-09T10:00:00Z' }))).toBe(
      '2026-08-09T10:00:00Z',
    );
    expect(getLastSavedAt(draft())).toBe('2026-08-01T10:00:00Z');
  });
});
