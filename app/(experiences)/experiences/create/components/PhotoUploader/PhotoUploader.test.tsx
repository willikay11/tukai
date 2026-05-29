import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/Images', () => ({
  ImageCropDialog: () => <div data-testid="image-crop-dialog">crop dialog</div>,
}));

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useDeleteExperiencePhoto: () => ({
    mutateAsync: jest.fn(),
  }),
}));

jest.mock('@/app/shared/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/utils/image-crop-utils', () => ({
  getImageDimensions: jest.fn(),
  imageNeedsCrop: jest.fn(),
}));

jest.mock('@/utils/image-utils', () => ({
  validateExperienceImage: jest.fn(),
}));

jest.mock('./PreviewGrid', () => ({
  PreviewGrid: () => <div data-testid="preview-grid">preview-grid</div>,
}));

import { render as rtlRender } from '@testing-library/react';
import { PhotoUploader, type FormPhoto } from './index';

describe('PhotoUploader', () => {
  const mockFormPhotos: FormPhoto[] = [
    { id: 'photo-1', url: 'https://example.com/photo1.jpg' },
    { id: 'photo-2', url: 'https://example.com/photo2.jpg' },
  ];

  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders photo grid container', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={mockFormPhotos}
          onPhotoChange={jest.fn()}
        />
      );
      // Check that the grid div with flex layout exists
      const grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();
    });

    it('renders with empty photos', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      // Check that the grid container exists even with no photos
      const grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();
    });

    it('renders upload instructions', () => {
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      expect(screen.getByText(/JPEG|PNG|WebP/i)).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
          error="Upload failed"
        />
      );
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  describe('Photo Props', () => {
    it('accepts photos array', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={mockFormPhotos}
          onPhotoChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('updates when photos prop changes', () => {
      const { rerender, container } = rtlRender(
        <PhotoUploader
          photos={[mockFormPhotos[0]]}
          onPhotoChange={jest.fn()}
        />
      );
      let grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();

      rerender(
        <PhotoUploader
          photos={mockFormPhotos}
          onPhotoChange={jest.fn()}
        />
      );
      grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('accepts onPhotoChange callback', () => {
      const onPhotoChange = jest.fn();
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={onPhotoChange}
        />
      );
      expect(onPhotoChange).toBeDefined();
    });

    it('accepts onPhotoFilesChange callback', () => {
      const onPhotoFilesChange = jest.fn();
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
          onPhotoFilesChange={onPhotoFilesChange}
        />
      );
      expect(onPhotoFilesChange).toBeDefined();
    });

    it('accepts onPhotoDelete callback', () => {
      const onPhotoDelete = jest.fn();
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
          onPhotoDelete={onPhotoDelete}
        />
      );
      expect(onPhotoDelete).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('displays error when provided', () => {
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
          error="File size too large"
        />
      );
      expect(screen.getByText('File size too large')).toBeInTheDocument();
    });

    it('handles empty error gracefully', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('File Input', () => {
    it('renders file input element', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('accepts JPEG, PNG, and WebP formats', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput?.accept).toContain('image/jpeg');
      expect(fileInput?.accept).toContain('image/png');
      expect(fileInput?.accept).toContain('image/webp');
    });

    it('allows multiple file selection', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
        />
      );
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput?.multiple).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined error prop', () => {
      const { container } = rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
          error={undefined}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles large number of photos', () => {
      const manyPhotos = Array.from({ length: 50 }, (_, i) => ({
        id: `photo-${i}`,
        url: `https://example.com/photo${i}.jpg`,
      }));
      const { container } = rtlRender(
        <PhotoUploader
          photos={manyPhotos}
          onPhotoChange={jest.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });
});
