import { render, screen } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';

import { type FormPhoto, PhotoUploader } from './index';

jest.mock('@/app/shared/components/Images', () => ({
  ImageCropDialog: () => <div data-testid="image-crop-dialog">crop dialog</div>,
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

describe('PhotoUploader', () => {
  const mockFormPhotos: FormPhoto[] = [
    { id: 'photo-1', url: 'https://example.com/photo1.jpg' },
    { id: 'photo-2', url: 'https://example.com/photo2.jpg' },
  ];

  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      expect(container).toBeInTheDocument();
    });

    it('renders photo grid container', () => {
      const { container } = rtlRender(
        <PhotoUploader photos={mockFormPhotos} onPhotoChange={jest.fn()} />,
      );
      // Check that the grid div with flex layout exists
      const grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();
    });

    it('renders with empty photos', () => {
      const { container } = rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      // Check that the grid container exists even with no photos
      const grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();
    });

    it('renders upload instructions', () => {
      rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      expect(screen.getByText(/JPEG|PNG|WebP/i)).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} error="Upload failed" />);
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  describe('Photo Props', () => {
    it('accepts photos array', () => {
      const { container } = rtlRender(
        <PhotoUploader photos={mockFormPhotos} onPhotoChange={jest.fn()} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('updates when photos prop changes', () => {
      const { rerender, container } = rtlRender(
        <PhotoUploader photos={[mockFormPhotos[0]]} onPhotoChange={jest.fn()} />,
      );
      let grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();

      rerender(<PhotoUploader photos={mockFormPhotos} onPhotoChange={jest.fn()} />);
      grid = container.querySelector('div.flex.flex-wrap');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('accepts onPhotoChange callback', () => {
      const onPhotoChange = jest.fn();
      rtlRender(<PhotoUploader photos={[]} onPhotoChange={onPhotoChange} />);
      expect(onPhotoChange).toBeDefined();
    });

    it('accepts onPhotoFilesChange callback', () => {
      const onPhotoFilesChange = jest.fn();
      rtlRender(
        <PhotoUploader
          photos={[]}
          onPhotoChange={jest.fn()}
          onPhotoFilesChange={onPhotoFilesChange}
        />,
      );
      expect(onPhotoFilesChange).toBeDefined();
    });

    it('accepts onPhotoDelete callback', () => {
      const onPhotoDelete = jest.fn();
      rtlRender(
        <PhotoUploader photos={[]} onPhotoChange={jest.fn()} onPhotoDelete={onPhotoDelete} />,
      );
      expect(onPhotoDelete).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('displays error when provided', () => {
      rtlRender(
        <PhotoUploader photos={[]} onPhotoChange={jest.fn()} error="File size too large" />,
      );
      expect(screen.getByText('File size too large')).toBeInTheDocument();
    });

    it('handles empty error gracefully', () => {
      const { container } = rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('File Input', () => {
    it('renders file input element', () => {
      const { container } = rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('accepts JPEG, PNG, and WebP formats', () => {
      const { container } = rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput?.accept).toContain('image/jpeg');
      expect(fileInput?.accept).toContain('image/png');
      expect(fileInput?.accept).toContain('image/webp');
    });

    it('allows multiple file selection', () => {
      const { container } = rtlRender(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput?.multiple).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined error prop', () => {
      const { container } = rtlRender(
        <PhotoUploader photos={[]} onPhotoChange={jest.fn()} error={undefined} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('handles large number of photos', () => {
      const manyPhotos = Array.from({ length: 50 }, (_, i) => ({
        id: `photo-${i}`,
        url: `https://example.com/photo${i}.jpg`,
      }));
      const { container } = rtlRender(
        <PhotoUploader photos={manyPhotos} onPhotoChange={jest.fn()} />,
      );
      expect(container).toBeInTheDocument();
    });
  });
});

// One uploader serves both the create-experience poster grid and a place's
// gallery, so what differs between them is configuration, not a second copy
describe('PhotoUploader, configured', () => {
  const photo = (extra: Partial<FormPhoto> = {}): FormPhoto => ({
    id: 'ph1',
    url: 'https://cdn.test/1.jpg',
    ...extra,
  });

  it('opens on the experience poster copy', () => {
    render(<PhotoUploader photos={[]} onPhotoChange={jest.fn()} />);

    expect(screen.getByText(/Upload experience poster/)).toBeInTheDocument();
  });

  it("takes the caller's own label and hint", () => {
    render(
      <PhotoUploader
        photos={[]}
        onPhotoChange={jest.fn()}
        label="Upload a few photos of the place"
        hint={null}
      />,
    );

    expect(screen.getByText('Upload a few photos of the place')).toBeInTheDocument();
    expect(screen.queryByText(/cropped automatically/)).not.toBeInTheDocument();
  });

  it("stops offering the add tile at the caller's limit", () => {
    const { rerender } = render(
      <PhotoUploader photos={[photo()]} onPhotoChange={jest.fn()} maxPhotos={1} />,
    );

    expect(screen.queryByText('Add Photo(s)')).not.toBeInTheDocument();

    rerender(<PhotoUploader photos={[photo()]} onPhotoChange={jest.fn()} maxPhotos={2} />);

    expect(screen.getByText('Add Photo(s)')).toBeInTheDocument();
  });

  // A place's photos have no endpoint that would keep an order
  it('drops the drag hint where the grid cannot be reordered', () => {
    const photos = [photo(), photo({ id: 'ph2' })];

    const { rerender } = render(<PhotoUploader photos={photos} onPhotoChange={jest.fn()} />);
    expect(screen.getByText(/Drag photos to reorder/)).toBeInTheDocument();

    rerender(<PhotoUploader photos={photos} onPhotoChange={jest.fn()} sortable={false} />);
    expect(screen.queryByText(/Drag photos to reorder/)).not.toBeInTheDocument();
  });

  it('marks the cover the API named, not just the first photo', () => {
    render(
      <PhotoUploader
        photos={[photo(), photo({ id: 'ph2', isCover: true })]}
        onPhotoChange={jest.fn()}
        sortable={false}
      />,
    );

    expect(screen.getAllByText('Cover')).toHaveLength(1);
  });

  // The endpoint belongs to whatever the photos hang off, so the component
  // must not reach for one of its own
  it('removes locally when no delete is supplied', async () => {
    const onPhotoFilesChange = jest.fn();
    render(
      <PhotoUploader
        photos={[photo()]}
        onPhotoChange={jest.fn()}
        onPhotoFilesChange={onPhotoFilesChange}
        sortable={false}
      />,
    );

    screen.getByRole('button', { name: 'Remove image' }).click();

    await Promise.resolve();
    expect(onPhotoFilesChange).toHaveBeenCalledWith([]);
  });

  it('calls the delete it is given for a photo that already exists', async () => {
    const onDeleteExisting = jest.fn().mockResolvedValue(undefined);
    render(
      <PhotoUploader
        photos={[photo()]}
        onPhotoChange={jest.fn()}
        onDeleteExisting={onDeleteExisting}
        sortable={false}
      />,
    );

    screen.getByRole('button', { name: 'Remove image' }).click();

    await Promise.resolve();
    expect(onDeleteExisting).toHaveBeenCalledWith('ph1');
  });
});
