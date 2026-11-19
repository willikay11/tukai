import { apiWithToken } from './apiService';
import { TukaiDraftError, draftTukaiReview } from './tukaiWriting';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { post: jest.fn() };

// DEV-375: TukAI writes or rewrites a review from a short brief
describe('draftTukaiReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiWithToken as jest.Mock).mockResolvedValue(api);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('writes a review from the brief and the rating', async () => {
    api.post.mockResolvedValue({ data: { text: ' Lovely garden, slow service. ', allowance: {} } });

    await expect(
      draftTukaiReview({
        subjectType: 'place',
        subjectId: 'pl1',
        brief: '  garden, slow service ',
        rating: 4,
      }),
    ).resolves.toBe('Lovely garden, slow service.');
    expect(api.post).toHaveBeenCalledWith('/v1/tukai/review-drafts/', {
      subject_type: 'place',
      subject_id: 'pl1',
      brief: 'garden, slow service',
      rating: 4,
    });
  });

  it('rewrites the text there, leaving out an empty rating', async () => {
    api.post.mockResolvedValue({ data: { text: 'Shorter.' } });

    await draftTukaiReview({
      subjectType: 'experience',
      subjectId: 'ex1',
      brief: 'shorter',
      rating: 0,
      currentText: 'A long review ',
    });

    expect(api.post).toHaveBeenCalledWith('/v1/tukai/review-drafts/', {
      subject_type: 'experience',
      subject_id: 'ex1',
      brief: 'shorter',
      current_text: 'A long review',
    });
  });

  it('says the free uses are gone on a 402', async () => {
    api.post.mockRejectedValue({
      response: { status: 402, data: { errors: [{ code: 'tukai_allowance_exhausted' }] } },
    });

    await expect(
      draftTukaiReview({ subjectType: 'place', subjectId: 'pl1', brief: 'nice' }),
    ).rejects.toMatchObject({ reason: 'allowance' });
  });

  it('passes on any other refusal with the API’s reason', async () => {
    api.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: [
            { code: 'invalid', detail: 'Ensure this field has no more than 1000 characters.' },
          ],
        },
      },
    });

    const failure = await draftTukaiReview({
      subjectType: 'place',
      subjectId: 'pl1',
      brief: 'x',
    }).catch((error) => error);

    expect(failure).toBeInstanceOf(TukaiDraftError);
    expect(failure).toMatchObject({
      reason: 'other',
      message: 'Ensure this field has no more than 1000 characters.',
    });
  });

  it('treats an empty draft as a failure', async () => {
    api.post.mockResolvedValue({ data: { text: '  ' } });

    await expect(
      draftTukaiReview({ subjectType: 'place', subjectId: 'pl1', brief: 'nice' }),
    ).rejects.toMatchObject({ reason: 'other' });
  });
});
