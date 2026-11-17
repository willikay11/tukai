import { draftIdFromConflict } from './draft-conflict';

// What createExperience rethrows for POST /v2/experiences/ (DEV-354, DEV-487)
const conflict = (errors: unknown, status = 409) => ({
  status,
  success: false,
  message: 'draft_exists',
  errors,
});

describe('draftIdFromConflict', () => {
  it('reads the existing draft id from a draft_exists 409', () => {
    expect(
      draftIdFromConflict(
        conflict([{ code: 'draft_exists', detail: 'draft-123', attr: 'draft_id' }]),
      ),
    ).toBe('draft-123');
  });

  it('ignores other 409s', () => {
    expect(
      draftIdFromConflict(conflict([{ code: 'already_member', detail: 'x', attr: null }])),
    ).toBeNull();
  });

  it('ignores a draft_exists code on any other status', () => {
    expect(
      draftIdFromConflict(
        conflict([{ code: 'draft_exists', detail: 'draft-123', attr: 'draft_id' }], 400),
      ),
    ).toBeNull();
  });

  it('ignores errors without the API error list', () => {
    expect(draftIdFromConflict({ status: 409, message: 'Conflict' })).toBeNull();
    expect(draftIdFromConflict(new Error('Network Error'))).toBeNull();
    expect(draftIdFromConflict(null)).toBeNull();
  });

  it('ignores a draft_exists error without an id', () => {
    expect(
      draftIdFromConflict(conflict([{ code: 'draft_exists', detail: '', attr: 'draft_id' }])),
    ).toBeNull();
  });
});
