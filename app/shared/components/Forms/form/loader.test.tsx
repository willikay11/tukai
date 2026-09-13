import { render } from '@testing-library/react';

import { Loader } from './loader';

describe('Loader', () => {
  describe('rendering', () => {
    it('renders SVG element', () => {
      const { container } = render(<Loader />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders two path elements', () => {
      const { container } = render(<Loader />);

      const paths = container.querySelectorAll('path');
      expect(paths).toHaveLength(2);
    });

    it('renders with correct viewBox', () => {
      const { container } = render(<Loader />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '3 3 18 18');
    });

    it('applies animate-spin class', () => {
      const { container } = render(<Loader />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('applies margin right class', () => {
      const { container } = render(<Loader />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('mr-2');
    });
  });

  describe('size prop', () => {
    it('applies small size classes when size is small', () => {
      const { container } = render(<Loader size="small" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('applies normal size classes when size is normal', () => {
      const { container } = render(<Loader size="normal" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');
    });

    it('applies large size classes when size is large', () => {
      const { container } = render(<Loader size="large" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-12', 'w-12');
    });

    it('defaults to normal size when no size prop provided', () => {
      const { container } = render(<Loader />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');
    });

    it('does not apply small classes when size is normal', () => {
      const { container } = render(<Loader size="normal" />);

      const svg = container.querySelector('svg');
      expect(svg).not.toHaveClass('h-4', 'w-4');
    });

    it('does not apply normal classes when size is large', () => {
      const { container } = render(<Loader size="large" />);

      const svg = container.querySelector('svg');
      expect(svg).not.toHaveClass('h-8', 'w-8');
    });
  });

  describe('path styling', () => {
    it('applies fill-gray-200 to first path (background circle)', () => {
      const { container } = render(<Loader />);

      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveClass('fill-gray-200');
    });

    it('applies fill-primary to second path (spinner arc)', () => {
      const { container } = render(<Loader />);

      const paths = container.querySelectorAll('path');
      expect(paths[1]).toHaveClass('fill-primary');
    });

    it('has correct path data for background circle', () => {
      const { container } = render(<Loader />);

      const paths = container.querySelectorAll('path');
      const backgroundPath = paths[0].getAttribute('d');
      expect(backgroundPath).toContain('M12 5C8.13401 5 5 8.13401');
    });

    it('has correct path data for spinner arc', () => {
      const { container } = render(<Loader />);

      const paths = container.querySelectorAll('path');
      const arcPath = paths[1].getAttribute('d');
      expect(arcPath).toContain('M16.9497 7.05015C14.2161 4.31648');
    });
  });

  describe('size variants', () => {
    it('small loader has explicit dimensions', () => {
      const { container } = render(<Loader size="small" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
      expect(svg).not.toHaveClass('h-8', 'h-12');
    });

    it('normal loader has explicit dimensions', () => {
      const { container } = render(<Loader size="normal" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');
      expect(svg).not.toHaveClass('h-4', 'h-12');
    });

    it('large loader has explicit dimensions', () => {
      const { container } = render(<Loader size="large" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-12', 'w-12');
      expect(svg).not.toHaveClass('h-4', 'h-8');
    });
  });

  describe('animation', () => {
    it('always has animate-spin class regardless of size', () => {
      const sizes: Array<'small' | 'normal' | 'large'> = ['small', 'normal', 'large'];

      sizes.forEach((size) => {
        const { container } = render(<Loader size={size} />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('animate-spin');
      });
    });

    it('always has margin right regardless of size', () => {
      const sizes: Array<'small' | 'normal' | 'large'> = ['small', 'normal', 'large'];

      sizes.forEach((size) => {
        const { container } = render(<Loader size={size} />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('mr-2');
      });
    });
  });
});
