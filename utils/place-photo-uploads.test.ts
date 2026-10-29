import { Photo } from '@/types/photo';

import { placePhotosAsUploads } from './place-photo-uploads';

const photo = (id: string, order: number, extra: Partial<Photo> = {}): Photo => ({
  id,
  mediaType: 'photo',
  order,
  photoUrl: `https://cdn/${id}.jpg`,
  ...extra,
});

const respondWith = (type: string, ok = true) =>
  ({ ok, blob: async () => new Blob(['bytes'], { type }) }) as Response;

describe('placePhotosAsUploads', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('downloads the place photos as image files', async () => {
    fetchMock.mockResolvedValue(respondWith('image/png'));

    const files = await placePhotosAsUploads([photo('a', 0)]);

    expect(fetchMock).toHaveBeenCalledWith('https://cdn/a.jpg');
    expect(files).toHaveLength(1);
    expect(files[0]).toBeInstanceOf(File);
    expect(files[0].name).toBe('reservation-anchor-0.png');
    expect(files[0].type).toBe('image/png');
  });

  it('takes the first three by order, not by arrival', async () => {
    fetchMock.mockResolvedValue(respondWith('image/jpeg'));

    await placePhotosAsUploads([photo('d', 3), photo('b', 1), photo('a', 0), photo('c', 2)]);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://cdn/a.jpg',
      'https://cdn/b.jpg',
      'https://cdn/c.jpg',
    ]);
  });

  it('prefers the large rendition', async () => {
    fetchMock.mockResolvedValue(respondWith('image/webp'));

    await placePhotosAsUploads([photo('a', 0, { photoWebpLgUrl: 'https://cdn/a-lg.webp' })]);

    expect(fetchMock).toHaveBeenCalledWith('https://cdn/a-lg.webp');
  });

  it('skips videos and photos with no address', async () => {
    fetchMock.mockResolvedValue(respondWith('image/jpeg'));

    const files = await placePhotosAsUploads([
      photo('clip', 0, { mediaType: 'video' }),
      photo('blank', 1, { photoUrl: null }),
      photo('a', 2),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(files).toHaveLength(1);
  });

  it('labels a download that is not served as an image as a jpeg', async () => {
    fetchMock.mockResolvedValue(respondWith('application/octet-stream'));

    const [file] = await placePhotosAsUploads([photo('a', 0)]);

    expect(file.type).toBe('image/jpeg');
    expect(file.name).toBe('reservation-anchor-0.jpeg');
  });

  it('drops a photo that cannot be downloaded and keeps the rest', async () => {
    fetchMock
      .mockResolvedValueOnce(respondWith('image/jpeg', false))
      .mockRejectedValueOnce(new Error('blocked by CORS'))
      .mockResolvedValueOnce(respondWith('image/jpeg'));

    const files = await placePhotosAsUploads([photo('a', 0), photo('b', 1), photo('c', 2)]);

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('reservation-anchor-2.jpeg');
  });

  it('returns nothing for a place with no photos', async () => {
    expect(await placePhotosAsUploads([])).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
