import { RECOMMENDED_MIN_DIMENSION, validateExperienceImage } from '@/utils/image-utils';

// jsdom does not decode images, so Image is stubbed to report whatever
// dimensions the test set up
let mockDimensions = { width: 1024, height: 1024 };
let shouldFailToLoad = false;

class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 0;
  height = 0;

  set src(_value: string) {
    setTimeout(() => {
      if (shouldFailToLoad) {
        this.onerror?.();
        return;
      }
      this.width = mockDimensions.width;
      this.height = mockDimensions.height;
      this.onload?.();
    }, 0);
  }
}

const makeFile = (type = 'image/png', size = 1024) => {
  const file = new File(['x'], 'poster.png', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

beforeAll(() => {
  (window as any).Image = MockImage;
  URL.createObjectURL = jest.fn(() => 'blob:mock');
  URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
  mockDimensions = { width: 1024, height: 1024 };
  shouldFailToLoad = false;
});

describe('validateExperienceImage — dimensions', () => {
  it('accepts an image below the recommended size and warns instead of blocking', async () => {
    mockDimensions = { width: 200, height: 200 };

    const result = await validateExperienceImage(makeFile());

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.warning).toContain('200×200px');
    expect(result.warning).toContain(String(RECOMMENDED_MIN_DIMENSION));
  });

  it('warns when only one side is below the recommended size', async () => {
    mockDimensions = { width: 1200, height: 320 };

    const result = await validateExperienceImage(makeFile());

    expect(result.valid).toBe(true);
    expect(result.warning).toContain('1200×320px');
  });

  it('accepts a large image with no warning', async () => {
    mockDimensions = { width: 2000, height: 2000 };

    const result = await validateExperienceImage(makeFile());

    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it('accepts an image exactly at the recommended size with no warning', async () => {
    mockDimensions = {
      width: RECOMMENDED_MIN_DIMENSION,
      height: RECOMMENDED_MIN_DIMENSION,
    };

    const result = await validateExperienceImage(makeFile());

    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
  });
});

describe('validateExperienceImage — other rules still block', () => {
  it('rejects an unsupported file type', async () => {
    const result = await validateExperienceImage(makeFile('image/gif'));

    expect(result.valid).toBe(false);
    expect(result.error).toContain('JPEG, PNG, or WebP');
  });

  it('rejects a file over 10MB', async () => {
    const result = await validateExperienceImage(makeFile('image/png', 11 * 1024 * 1024));

    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('rejects an unreadable image', async () => {
    shouldFailToLoad = true;

    const result = await validateExperienceImage(makeFile());

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Could not read');
  });
});
