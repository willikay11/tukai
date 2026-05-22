import { render, screen } from '@testing-library/react';

import { IconComponent } from './IconComponent';

jest.mock('@hugeicons/react', () => ({
  HugeiconsIcon: ({ icon, size, color, className }: any) => (
    <span
      data-testid="hugeicons-icon"
      data-icon={icon?.name || 'unknown'}
      data-size={size}
      data-color={color}
      className={className}
    >
      Icon
    </span>
  ),
}));

jest.mock('@hugeicons-pro/core-twotone-rounded', () => ({
  MapPinpoint01Icon: { name: 'MapPinpoint01Icon' },
  Location01Icon: { name: 'Location01Icon' },
  Calendar01Icon: { name: 'Calendar01Icon' },
  Directions01Icon: { name: 'Directions01Icon' },
  Cancel01Icon: { name: 'Cancel01Icon' },
}));

jest.mock('@hugeicons-pro/core-solid-rounded', () => ({
  MapPinpoint01Icon: { name: 'MapPinpoint01Icon' },
  Location01Icon: { name: 'Location01Icon' },
}));

describe('IconComponent', () => {
  describe('rendering with twotone variant (default)', () => {
    it('renders valid twotone icon', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders with default size 20', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '20');
    });

    it('renders with custom size', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" size={24} />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '24');
    });

    it('renders with default color bg-gray-700', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-color', 'bg-gray-700');
    });

    it('renders with custom color', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" color="white" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-color', 'white');
    });

    it('applies custom className', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" className="animate-spin text-red-500" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveClass('animate-spin', 'text-red-500');
    });

    it('renders multiple valid twotone icons', () => {
      const { rerender } = render(<IconComponent iconName="MapPinpoint01Icon" />);
      expect(screen.getByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="Location01Icon" />);
      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('rendering with solid variant', () => {
    it('renders valid solid icon', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders solid icon with custom size', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" size={16} />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '16');
    });

    it('renders solid icon with custom color', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" color="primary" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-color', 'primary');
    });
  });

  describe('invalid icon names', () => {
    it('returns null for invalid twotone icon name', () => {
      const { container } = render(<IconComponent iconName="InvalidIconName" variant="twotone" />);

      expect(container.firstChild).toBeNull();
    });

    it('returns null for invalid solid icon name', () => {
      const { container } = render(<IconComponent iconName="InvalidIconName" variant="solid" />);

      expect(container.firstChild).toBeNull();
    });

    it('returns null when icon does not exist in either variant', () => {
      const { container } = render(<IconComponent iconName="NonExistentIcon" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('variant switching', () => {
    it('switches from twotone to solid for same icon', () => {
      const { rerender } = render(<IconComponent iconName="MapPinpoint01Icon" variant="twotone" />);

      let icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();

      rerender(<IconComponent iconName="MapPinpoint01Icon" variant="solid" />);

      icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });

    it('returns null when switching to twotone variant for solid-only icon', () => {
      // Calendar01Icon is only in twotone mock
      const { rerender, container } = render(
        <IconComponent iconName="Calendar01Icon" variant="twotone" />,
      );

      expect(screen.getByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="Calendar01Icon" variant="solid" />);

      // Calendar01Icon doesn't exist in solid, should return null
      expect(container.querySelector('[data-testid="hugeicons-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('prop combinations', () => {
    it('renders with all props specified', () => {
      render(
        <IconComponent
          iconName="MapPinpoint01Icon"
          variant="twotone"
          size={18}
          color="red"
          className="animate-bounce"
        />,
      );

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '18');
      expect(icon).toHaveAttribute('data-color', 'red');
      expect(icon).toHaveClass('animate-bounce');
    });

    it('renders with variant and no other optional props', () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '20');
      expect(icon).toHaveAttribute('data-color', 'bg-gray-700');
    });
  });

  describe('common icon usage patterns', () => {
    it('renders Location01Icon with custom styling', () => {
      render(<IconComponent iconName="Location01Icon" size={16} color="white" className="mr-2" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '16');
      expect(icon).toHaveAttribute('data-color', 'white');
      expect(icon).toHaveClass('mr-2');
    });

    it('renders Calendar01Icon for date representation', () => {
      render(<IconComponent iconName="Calendar01Icon" size={12} color="white" className="mr-1" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '12');
      expect(icon).toHaveAttribute('data-color', 'white');
    });

    it('renders Cancel01Icon', () => {
      render(<IconComponent iconName="Cancel01Icon" size={12} color="white" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });
  });
});
