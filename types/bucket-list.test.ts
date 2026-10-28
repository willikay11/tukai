import { bucketListCoverPhoto } from './bucket-list';

describe('bucketListCoverPhoto', () => {
  it('uses the cover image when the API set one', () => {
    expect(bucketListCoverPhoto({ coverImage: 'https://cdn.example.com/cover.jpg' })).toBe(
      'https://cdn.example.com/cover.jpg',
    );
  });

  /**
   * `coverImage` is reliably blank on the list the API actually sends back -
   * `coverPhotos` is where the real photo lives, as an array of saved items'
   * photos.
   */
  it('falls back to the first of the cover photos when there is no cover image', () => {
    expect(
      bucketListCoverPhoto({
        coverPhotos: ['https://cdn.example.com/one.jpg', 'https://cdn.example.com/two.jpg'],
      }),
    ).toBe('https://cdn.example.com/one.jpg');
  });

  it('falls back to a single cover photo sent as one string, not a list', () => {
    expect(bucketListCoverPhoto({ coverPhotos: 'https://cdn.example.com/one.jpg' })).toBe(
      'https://cdn.example.com/one.jpg',
    );
  });

  it('is undefined when neither field has anything to show', () => {
    expect(bucketListCoverPhoto({})).toBeUndefined();
    expect(bucketListCoverPhoto({ coverPhotos: [] })).toBeUndefined();
  });
});
