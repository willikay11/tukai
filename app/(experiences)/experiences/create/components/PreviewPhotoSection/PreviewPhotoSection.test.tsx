import { render, screen } from '@testing-library/react';

import { PreviewPhotoSection } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

jest.mock('@/app/shared/components/Images/SquarePhotoStrip', () => ({
  // Renders real <img> tags as well as a count, so tests can assert either
  SquarePhotoStrip: ({ photos }: any) => (
    <div>
      <span>{`strip-${photos.length}`}</span>
      {photos.map((photo: string) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={photo} src={photo} alt="" />
      ))}
    </div>
  ),
}));

describe('PreviewPhotoSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<PreviewPhotoSection />);
      expect(container).toBeInTheDocument();
    });

    it('displays placeholder when no photos', () => {
      render(<PreviewPhotoSection photos={[]} />);
      expect(screen.getByText('No image available')).toBeInTheDocument();
    });

    it('displays add photos button when no photos and onEdit provided', () => {
      const onEdit = jest.fn();
      render(<PreviewPhotoSection photos={[]} onEdit={onEdit} />);
      expect(screen.getByText('Add photos')).toBeInTheDocument();
    });

    it('does not display add photos button when no onEdit callback', () => {
      render(<PreviewPhotoSection photos={[]} />);
      expect(screen.queryByText('Add photos')).not.toBeInTheDocument();
    });
  });

  describe('Photo Display', () => {
    it('displays single photo with single image element', () => {
      const { container } = render(
        <PreviewPhotoSection photos={['https://example.com/photo.jpg']} />,
      );
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('hands every photo to the strip', () => {
      render(
        <PreviewPhotoSection
          photos={['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']}
        />,
      );
      expect(screen.getByText('strip-2')).toBeInTheDocument();
    });

    it('displays edit button when photos exist and onEdit provided', () => {
      const onEdit = jest.fn();
      render(<PreviewPhotoSection photos={['https://example.com/photo.jpg']} onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not display edit button when onEdit not provided', () => {
      render(<PreviewPhotoSection photos={['https://example.com/photo.jpg']} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when add photos button clicked', () => {
      const onEdit = jest.fn();
      render(<PreviewPhotoSection photos={[]} onEdit={onEdit} />);
      const addButton = screen.getByText('Add photos');
      addButton.click();
      expect(onEdit).toHaveBeenCalled();
    });

    it('calls onEdit when edit button clicked for existing photos', () => {
      const onEdit = jest.fn();
      render(<PreviewPhotoSection photos={['https://example.com/photo.jpg']} onEdit={onEdit} />);
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });
});
