import { assertValidImageFiles } from './images';

// jsdom's Blob has no arrayBuffer(); the browser's does
beforeAll(() => {
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
      return new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(this);
      });
    };
  }
});

const fileOf = (bytes: number[], name: string, type: string) =>
  new File([new Uint8Array([...bytes, ...new Array(16).fill(0)])], name, { type });

const ascii = (text: string) => text.split('').map((char) => char.charCodeAt(0));

describe('assertValidImageFiles', () => {
  // DEV-510: the default photo format on iPhones and Macs; the API reads it
  it('accepts a HEIC photo', async () => {
    const heic = fileOf([0, 0, 0, 0x18, ...ascii('ftypheic')], 'IMG_0001.HEIC', 'image/heic');

    await expect(assertValidImageFiles([heic])).resolves.toBeUndefined();
  });

  it('accepts a HEIF photo with a mif1 brand and no type', async () => {
    const heif = fileOf([0, 0, 0, 0x18, ...ascii('ftypmif1')], 'photo.heif', '');

    await expect(assertValidImageFiles([heif])).resolves.toBeUndefined();
  });

  it('still refuses a video that shares the box layout', async () => {
    const mp4 = fileOf([0, 0, 0, 0x18, ...ascii('ftypisom')], 'clip.jpg', 'image/jpeg');

    await expect(assertValidImageFiles([mp4])).rejects.toThrow('Invalid image file(s): clip.jpg');
  });

  it('accepts a JPEG as before', async () => {
    const jpeg = fileOf([0xff, 0xd8, 0xff, 0xe0], 'a.jpg', 'image/jpeg');

    await expect(assertValidImageFiles([jpeg])).resolves.toBeUndefined();
  });
});
