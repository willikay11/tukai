import { PlaceCategory, categoryImageOf } from './placeCategory';

const category = (images?: PlaceCategory['images']): PlaceCategory => ({
  id: 'c1',
  name: 'Nairobi',
  icon: '',
  group: 'cities',
  placesCount: 12,
  images,
});

describe('categoryImageOf', () => {
  // The API returns an array; the card shows the first of them
  it('takes the first image in the array', () => {
    const image = categoryImageOf(
      category([
        { id: 'i1', imageUrl: 'https://cdn.tukai.co/first.jpg' },
        { id: 'i2', imageUrl: 'https://cdn.tukai.co/second.jpg' },
      ]),
    );

    expect(image).toBe('https://cdn.tukai.co/first.jpg');
  });

  it('falls back to the raw image field when there is no url', () => {
    expect(categoryImageOf(category([{ id: 'i1', image: 'https://cdn.tukai.co/raw.jpg' }]))).toBe(
      'https://cdn.tukai.co/raw.jpg',
    );
  });

  it('returns null when the category carries no images', () => {
    expect(categoryImageOf(category([]))).toBeNull();
    expect(categoryImageOf(category())).toBeNull();
  });
});
