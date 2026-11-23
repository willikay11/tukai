import { apiWithToken } from '@/services/apiService';

import {
  createExperienceRating,
  deleteExperienceRating,
  deleteExperienceRatingPhoto,
  updateExperienceRating,
} from './experience';

jest.mock('@/services/apiService', () => ({
  api: { get: jest.fn() },
  apiWithToken: jest.fn(),
}));

const post = jest.fn();
const patch = jest.fn();
const del = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (apiWithToken as jest.Mock).mockResolvedValue({ post, patch, delete: del });
  post.mockResolvedValue({ status: 201, data: {} });
  patch.mockResolvedValue({ status: 200, data: { id: 'r1', highlights: ['great_host'] } });
  del.mockResolvedValue({ status: 204 });
});

// DEV-421
describe('createExperienceRating', () => {
  it('sends each highlight as its own entry', async () => {
    await createExperienceRating('e1', {
      rating: 5,
      review: 'Great.',
      highlights: ['great_host', 'felt_safe'],
    });

    const form = post.mock.calls[0][1] as FormData;
    expect(form.getAll('highlights')).toEqual(['great_host', 'felt_safe']);
  });
});

// DEV-394
describe('updateExperienceRating', () => {
  it('sends JSON without new photos, so no highlights reads as an empty list', async () => {
    await updateExperienceRating('e1', 'r1', { rating: 4, review: 'Fine.', highlights: [] });

    expect(patch).toHaveBeenCalledWith('/v1/experiences/e1/ratings/r1/', {
      rating: 4,
      review: 'Fine.',
      highlights: [],
    });
  });

  it('sends a form when there are new photos', async () => {
    const photo = new File(['x'], 'a.jpg', { type: 'image/jpeg' });

    await updateExperienceRating('e1', 'r1', {
      rating: 4,
      review: 'Fine.',
      highlights: ['good_pace'],
      photos: [photo],
    });

    const form = patch.mock.calls[0][1] as FormData;
    expect(form.get('rating')).toBe('4');
    expect(form.getAll('highlights')).toEqual(['good_pace']);
    expect(form.getAll('new_photos')).toHaveLength(1);
  });

  it('reads the saved review back', async () => {
    const result = await updateExperienceRating('e1', 'r1', {
      rating: 4,
      review: 'Fine.',
      highlights: [],
    });

    expect(result.data).toEqual({ id: 'r1', highlights: ['great_host'] });
  });

  it('throws the API reason', async () => {
    patch.mockRejectedValue({
      response: { status: 403, data: { detail: 'You can only change your own rating.' } },
    });

    await expect(
      updateExperienceRating('e1', 'r1', { rating: 4, review: 'x', highlights: [] }),
    ).rejects.toThrow('You can only change your own rating.');
  });
});

describe('deleting', () => {
  it('deletes the review', async () => {
    await deleteExperienceRating('e1', 'r1');

    expect(del).toHaveBeenCalledWith('/v1/experiences/e1/ratings/r1/');
  });

  it('deletes one of its photos', async () => {
    await deleteExperienceRatingPhoto('e1', 'r1', 'p1');

    expect(del).toHaveBeenCalledWith('/v1/experiences/e1/ratings/r1/photos/p1/');
  });
});
