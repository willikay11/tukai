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

/**
 * {@link IconComponent} named-imports only the icons it actually uses from
 * each package, so a mock only needs to hand back *something* for whichever
 * names get imported - which real icon name is tested is decided entirely by
 * `IconComponent`'s own TWOTONE_ICONS/BULK_ICONS/DUOTONE_ICONS maps, not by
 * this mock.
 */
/**
 * {@link IconComponent} named-imports only the icons it actually uses from
 * each package, so a mock only needs to hand back *something* for whichever
 * names get imported - which real icon name is tested is decided entirely by
 * `IconComponent`'s own TWOTONE_ICONS/BULK_ICONS/DUOTONE_ICONS maps, not by
 * this mock.
 */
jest.mock(
  '@hugeicons-pro/core-twotone-rounded',
  () => new Proxy({}, { get: (_target, name) => ({ name }) }),
);
jest.mock(
  '@hugeicons-pro/core-bulk-rounded',
  () => new Proxy({}, { get: (_target, name) => ({ name }) }),
);
jest.mock(
  '@hugeicons-pro/core-duotone-rounded',
  () => new Proxy({}, { get: (_target, name) => ({ name }) }),
);

describe('IconComponent', () => {
  describe('rendering with twotone variant (default)', () => {
    it('renders valid twotone icon', () => {
      render(<IconComponent iconName="Mail01Icon" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders with default size 20', () => {
      render(<IconComponent iconName="Mail01Icon" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '20');
    });

    it('renders with custom size', () => {
      render(<IconComponent iconName="Mail01Icon" size={24} />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '24');
    });

    it('renders with default color bg-gray-700', () => {
      render(<IconComponent iconName="Mail01Icon" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-color', 'bg-gray-700');
    });

    it('renders with custom color', () => {
      render(<IconComponent iconName="Mail01Icon" color="white" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-color', 'white');
    });

    it('applies custom className', () => {
      render(<IconComponent iconName="Mail01Icon" className="animate-spin text-red-500" />);

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveClass('animate-spin', 'text-red-500');
    });

    it('renders multiple valid twotone icons', () => {
      const { rerender } = render(<IconComponent iconName="Mail01Icon" />);
      expect(screen.getByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="Location01Icon" />);
      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  /**
   * Nothing in the app renders this variant today, so `IconComponent` has no
   * icons registered for it - see the comment above `SOLID_ICONS`. It should
   * behave exactly like an unknown name until something needs it for real.
   */
  describe('rendering with solid variant', () => {
    it('renders nothing - no solid icons are registered yet', () => {
      const { container } = render(<IconComponent iconName="Mail01Icon" variant="solid" />);

      expect(container.firstChild).toBeNull();
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
    it('switches from twotone to bulk for the same icon', () => {
      const { rerender } = render(
        <IconComponent iconName="InformationCircleIcon" variant="twotone" />,
      );

      let icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();

      rerender(<IconComponent iconName="InformationCircleIcon" variant="bulk" />);

      icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toBeInTheDocument();
    });

    it('returns null when switching to a variant the icon has no registered counterpart in', () => {
      // Mail01Icon is only registered for twotone
      const { rerender, container } = render(
        <IconComponent iconName="Mail01Icon" variant="twotone" />,
      );

      expect(screen.getByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="Mail01Icon" variant="bulk" />);

      expect(container.querySelector('[data-testid="hugeicons-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('prop combinations', () => {
    it('renders with all props specified', () => {
      render(
        <IconComponent
          iconName="Mail01Icon"
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
      render(<IconComponent iconName="StarIcon" variant="bulk" />);

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

  /**
   * The style is the package an icon comes from, not a prop on the icon - so a
   * variant only exists here once its package is a dependency.
   */
  describe('rendering with bulk variant', () => {
    it('renders a bulk icon', () => {
      render(<IconComponent iconName="ShoppingBasketDone02Icon" variant="bulk" />);

      expect(screen.getByTestId('hugeicons-icon')).toHaveAttribute(
        'data-icon',
        'ShoppingBasketDone02Icon',
      );
    });

    it('returns null for a name the bulk package does not carry', () => {
      const { container } = render(<IconComponent iconName="Calendar01Icon" variant="bulk" />);

      expect(container.firstChild).toBeNull();
    });

    // Rather than quietly falling back to another style, which would draw the
    // wrong glyph and look deliberate
    it('does not fall back to another style', () => {
      const { container } = render(<IconComponent iconName="Cancel01Icon" variant="bulk" />);

      expect(container.firstChild).toBeNull();
    });

    it('takes the same size and colour as the others', () => {
      render(
        <IconComponent
          iconName="ShoppingBasketDone02Icon"
          variant="bulk"
          size={21}
          color="currentColor"
        />,
      );

      const icon = screen.getByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '21');
      expect(icon).toHaveAttribute('data-color', 'currentColor');
    });
  });

  describe('rendering with duotone variant', () => {
    it('renders a duotone icon', () => {
      render(<IconComponent iconName="CalendarAdd01Icon" variant="duotone" />);

      expect(screen.getByTestId('hugeicons-icon')).toHaveAttribute(
        'data-icon',
        'CalendarAdd01Icon',
      );
    });

    it('returns null for a name the duotone package does not carry', () => {
      const { container } = render(<IconComponent iconName="Calendar01Icon" variant="duotone" />);

      expect(container.firstChild).toBeNull();
    });

    it('does not fall back to another style', () => {
      const { container } = render(<IconComponent iconName="Cancel01Icon" variant="duotone" />);

      expect(container.firstChild).toBeNull();
    });
  });
});
