import { render, screen } from '@testing-library/react';
import { Rating } from './Rating';

jest.mock('@hugeicons/react-pro', () => ({
  StarIcon: ({ size, className }: { size: number; className?: string }) => (
    <span data-testid="star" className={className} data-size={size}>
      ★
    </span>
  ),
}));

describe('Rating', () => {
  describe('single star rendering', () => {
    it('renders single star by default', () => {
      render(<Rating rating={4.5} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(1);
    });

    it('applies yellow color to star when rating > 0', () => {
      render(<Rating rating={4.5} />);

      const star = screen.getByTestId('star');
      expect(star).toHaveClass('text-yellow-400');
    });

    it('applies gray color to star when rating is 0', () => {
      render(<Rating rating={0} />);

      const star = screen.getByTestId('star');
      expect(star).toHaveClass('text-gray-300');
    });

    it('renders star with correct size', () => {
      render(<Rating rating={3} />);

      const star = screen.getByTestId('star');
      expect(star).toHaveAttribute('data-size', '14');
    });

    it('renders star with margin right class', () => {
      render(<Rating rating={4} />);

      const star = screen.getByTestId('star');
      expect(star).toHaveClass('mr-1');
    });
  });

  describe('with showCount prop', () => {
    it('shows count when showCount is true', () => {
      render(<Rating rating={4.5} showCount={true} />);

      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('does not show count when showCount is false', () => {
      render(<Rating rating={4.5} showCount={false} />);

      expect(screen.queryByText('4.5')).not.toBeInTheDocument();
    });

    it('displays count with correct styling', () => {
      const { container } = render(<Rating rating={5} showCount={true} />);

      const countSpan = container.querySelector('span:last-child');
      expect(countSpan).toHaveClass('text-sm', 'font-medium');
      expect(countSpan).toHaveTextContent('5');
    });

    it('shows zero rating count', () => {
      render(<Rating rating={0} showCount={true} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('with showMultiStar prop', () => {
    it('renders multiple stars when showMultiStar is true', () => {
      render(<Rating rating={3} showMultiStar={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(3);
    });

    it('renders correct number of stars matching rating', () => {
      render(<Rating rating={5} showMultiStar={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(5);
    });

    it('renders zero stars when rating is 0 with showMultiStar', () => {
      const { container } = render(<Rating rating={0} showMultiStar={true} />);

      // When length is 0, Array.from creates an array with 0 elements
      const stars = container.querySelectorAll('[data-testid="star"]');
      expect(stars).toHaveLength(0);
    });

    it('applies yellow color to all multiple stars when rating > 0', () => {
      render(<Rating rating={4} showMultiStar={true} />);

      const stars = screen.getAllByTestId('star');
      stars.forEach((star) => {
        expect(star).toHaveClass('text-yellow-400');
      });
    });

    it('applies margin class to multiple stars', () => {
      render(<Rating rating={3} showMultiStar={true} />);

      const stars = screen.getAllByTestId('star');
      stars.forEach((star) => {
        expect(star).toHaveClass('mr-0.5');
      });
    });

    it('renders single star when rating is 1 with showMultiStar', () => {
      render(<Rating rating={1} showMultiStar={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(1);
    });
  });

  describe('with showMultiStar and showCount together', () => {
    it('renders multiple stars and count', () => {
      render(<Rating rating={4} showMultiStar={true} showCount={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(4);
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('displays rating number with multiple stars', () => {
      render(<Rating rating={3.5} showMultiStar={true} showCount={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(3);
      expect(screen.getByText('3.5')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles decimal ratings', () => {
      render(<Rating rating={3.7} showCount={true} />);

      expect(screen.getByText('3.7')).toBeInTheDocument();
    });

    it('handles very high ratings with showMultiStar', () => {
      render(<Rating rating={10} showMultiStar={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(10);
    });

    it('renders with all props enabled', () => {
      render(<Rating rating={4} showMultiStar={true} showCount={true} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(4);
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });
});
