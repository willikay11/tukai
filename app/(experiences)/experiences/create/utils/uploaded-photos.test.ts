import { Photo } from '@/types/photo';

import { matchUploadedPhotos } from './uploaded-photos';

const file = (name: string) => new File(['x'], name, { type: 'image/jpeg' });
const server = (id: string, caption: string): Photo =>
  ({ id, caption, mediaType: 'photo' }) as Photo;

// DEV-510: after an upload, each local photo takes its server copy's id, so
// the next save doesn't upload it again
describe('matchUploadedPhotos', () => {
  const pending = [
    { id: 'tmp-1', file: file('beach.jpg') },
    { id: 'tmp-2', file: file('hike.heic') },
  ];

  it('matches by file name, whatever order the API lists them in', () => {
    const matches = matchUploadedPhotos(
      pending,
      [server('old', 'cover.jpg'), server('s-2', 'hike.heic'), server('s-1', 'beach.jpg')],
      new Set(['old', 'tmp-1', 'tmp-2']),
    );

    expect(matches.get('tmp-1')?.id).toBe('s-1');
    expect(matches.get('tmp-2')?.id).toBe('s-2');
  });

  it('falls back to position when names do not help and the counts agree', () => {
    const matches = matchUploadedPhotos(
      pending,
      [server('s-1', ''), server('s-2', '')],
      new Set(['tmp-1', 'tmp-2']),
    );

    expect(matches.get('tmp-1')?.id).toBe('s-1');
    expect(matches.get('tmp-2')?.id).toBe('s-2');
  });

  it('gives no match rather than guessing when the counts differ', () => {
    const matches = matchUploadedPhotos(pending, [server('s-9', '')], new Set());

    expect(matches.get('tmp-1')).toBeUndefined();
    expect(matches.get('tmp-2')).toBeUndefined();
  });

  it('never gives two photos with the same name the same server photo', () => {
    const twins = [
      { id: 'a', file: file('IMG.jpg') },
      { id: 'b', file: file('IMG.jpg') },
    ];
    const matches = matchUploadedPhotos(
      twins,
      [server('s-a', 'IMG.jpg'), server('s-b', 'IMG.jpg')],
      new Set(),
    );

    expect(new Set([matches.get('a')?.id, matches.get('b')?.id])).toEqual(new Set(['s-a', 's-b']));
  });
});
