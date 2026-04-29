import { render, screen } from '@testing-library/react';
import { Pills } from './index';

jest.mock('@/components/ui/pill', () => ({
  Pill: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pill">{children}</div>
  ),
}));

describe('Pills', () => {
  describe('rendering', () => {
    it('renders all pills when pills count is less than showMax', () => {
      render(<Pills pills={['Hiking', 'Beach']} showMax={3} />);

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Beach')).toBeInTheDocument();
    });

    it('renders only showMax pills', () => {
      render(<Pills pills={['Hiking', 'Beach', 'Mountain', 'Water']} showMax={2} />);

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Beach')).toBeInTheDocument();
      expect(screen.queryByText('Mountain')).not.toBeInTheDocument();
      expect(screen.queryByText('Water')).not.toBeInTheDocument();
    });

    it('renders default showMax of 2', () => {
      render(<Pills pills={['Hiking', 'Beach', 'Mountain']} />);

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Beach')).toBeInTheDocument();
      expect(screen.queryByText('Mountain')).not.toBeInTheDocument();
    });

    it('shows count of remaining pills when exceeding showMax', () => {
      render(<Pills pills={['Hiking', 'Beach', 'Mountain', 'Water', 'Desert']} showMax={2} />);

      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('does not show remaining count when pills <= showMax', () => {
      render(<Pills pills={['Hiking', 'Beach']} showMax={3} />);

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it('renders with custom showMax', () => {
      render(<Pills pills={['A', 'B', 'C', 'D', 'E']} showMax={3} />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.queryByText('D')).not.toBeInTheDocument();
      expect(screen.queryByText('E')).not.toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('renders empty when pills array is empty', () => {
      const { container } = render(<Pills pills={[]} showMax={2} />);

      const pills = container.querySelectorAll('[data-testid="pill"]');
      expect(pills).toHaveLength(0);
    });
  });

  describe('pill content', () => {
    it('renders pill text with correct styling', () => {
      render(<Pills pills={['Hiking']} />);

      const text = screen.getByText('Hiking');
      expect(text).toHaveClass('text-sm', 'font-normal', 'text-white');
    });

    it('renders count badge with correct styling', () => {
      render(<Pills pills={['A', 'B', 'C']} showMax={1} />);

      const countText = screen.getByText('+2');
      expect(countText).toHaveClass('text-sm', 'font-normal', 'text-white');
    });
  });

  describe('edge cases', () => {
    it('handles single pill', () => {
      render(<Pills pills={['Hiking']} showMax={2} />);

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it('handles showMax of 1', () => {
      render(<Pills pills={['Hiking', 'Beach']} showMax={1} />);

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.queryByText('Beach')).not.toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('handles showMax of 0', () => {
      render(<Pills pills={['Hiking', 'Beach']} showMax={0} />);

      expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
      expect(screen.queryByText('Beach')).not.toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('handles very long pill names', () => {
      const longName = 'A'.repeat(50);
      render(<Pills pills={[longName]} showMax={2} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('renders flex container with gap', () => {
      const { container } = render(<Pills pills={['Hiking', 'Beach']} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-2');
    });

    it('renders correct number of Pill components', () => {
      const { container } = render(<Pills pills={['A', 'B', 'C', 'D']} showMax={2} />);

      const pills = container.querySelectorAll('[data-testid="pill"]');
      // 2 pills + 1 count badge = 3
      expect(pills).toHaveLength(3);
    });
  });

  describe('accessibility', () => {
    it('renders text that screen readers can access', () => {
      render(<Pills pills={['Hiking', 'Beach']} />);

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Beach')).toBeInTheDocument();
    });

    it('shows full count in remaining pills badge', () => {
      render(<Pills pills={['Hiking', 'Beach', 'Mountain', 'Water', 'Desert']} showMax={2} />);

      const remaining = screen.getByText('+3');
      expect(remaining).toBeInTheDocument();
      expect(remaining.textContent).toBe('+3');
    });
  });
});
