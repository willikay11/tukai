import { act, render, screen } from '@testing-library/react';

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
 * Stands in for each package's own `/loader` entry point - the thing
 * {@link IconComponent} now calls instead of importing a whole package. Each
 * resolves only the names it is told to carry, and rejects (same as the real
 * loader does) for anything else, so a variant with no counterpart for a name
 * behaves the same way a missing key in a wildcard import used to.
 */
const mockLoader = (known: string[]) => ({
  loadIcon: (name: string) =>
    known.includes(name) ? Promise.resolve({ name }) : Promise.reject(new Error(`Icon not found: ${name}`)),
});

jest.mock('@hugeicons-pro/core-twotone-rounded/loader', () =>
  mockLoader(['MapPinpoint01Icon', 'Location01Icon', 'Calendar01Icon', 'Directions01Icon', 'Cancel01Icon']),
);
jest.mock('@hugeicons-pro/core-solid-rounded/loader', () =>
  mockLoader(['MapPinpoint01Icon', 'Location01Icon']),
);
jest.mock('@hugeicons-pro/core-bulk-rounded/loader', () =>
  mockLoader(['ShoppingBasketDone02Icon', 'StarIcon']),
);
jest.mock('@hugeicons-pro/core-duotone-rounded/loader', () => mockLoader(['CalendarAdd01Icon']));

// Lets a rejected load's `.catch` run before an assertion that nothing ever
// appears - render() alone only flushes up to the first microtask
const flush = () => act(async () => {});

describe('IconComponent', () => {
  describe('rendering with twotone variant (default)', () => {
    it('renders valid twotone icon', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" />);

      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();
    });

    it('renders with default size 20', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-size', '20');
    });

    it('renders with custom size', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" size={24} />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-size', '24');
    });

    it('renders with default color bg-gray-700', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-color', 'bg-gray-700');
    });

    it('renders with custom color', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" color="white" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-color', 'white');
    });

    it('applies custom className', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" className="animate-spin text-red-500" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveClass('animate-spin', 'text-red-500');
    });

    it('renders multiple valid twotone icons', async () => {
      const { rerender } = render(<IconComponent iconName="MapPinpoint01Icon" />);
      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="Location01Icon" />);
      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-icon', 'Location01Icon');
    });
  });

  describe('rendering with solid variant', () => {
    it('renders valid solid icon', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" />);

      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();
    });

    it('renders solid icon with custom size', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" size={16} />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-size', '16');
    });

    it('renders solid icon with custom color', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" color="primary" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute('data-color', 'primary');
    });
  });

  describe('invalid icon names', () => {
    it('returns null for invalid twotone icon name', async () => {
      const { container } = render(<IconComponent iconName="InvalidIconName" variant="twotone" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });

    it('returns null for invalid solid icon name', async () => {
      const { container } = render(<IconComponent iconName="InvalidIconName" variant="solid" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });

    it('returns null when icon does not exist in either variant', async () => {
      const { container } = render(<IconComponent iconName="NonExistentIcon" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('variant switching', () => {
    it('switches from twotone to solid for same icon', async () => {
      const { rerender } = render(<IconComponent iconName="MapPinpoint01Icon" variant="twotone" />);
      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="MapPinpoint01Icon" variant="solid" />);
      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();
    });

    it('returns null when switching to twotone variant for solid-only icon', async () => {
      // Calendar01Icon is only in the twotone mock
      const { rerender, container } = render(
        <IconComponent iconName="Calendar01Icon" variant="twotone" />,
      );
      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();

      rerender(<IconComponent iconName="Calendar01Icon" variant="solid" />);

      // Calendar01Icon doesn't exist in solid, should return null
      await flush();
      expect(container.querySelector('[data-testid="hugeicons-icon"]')).not.toBeInTheDocument();
    });
  });

  describe('prop combinations', () => {
    it('renders with all props specified', async () => {
      render(
        <IconComponent
          iconName="MapPinpoint01Icon"
          variant="twotone"
          size={18}
          color="red"
          className="animate-bounce"
        />,
      );

      const icon = await screen.findByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '18');
      expect(icon).toHaveAttribute('data-color', 'red');
      expect(icon).toHaveClass('animate-bounce');
    });

    it('renders with variant and no other optional props', async () => {
      render(<IconComponent iconName="MapPinpoint01Icon" variant="solid" />);

      const icon = await screen.findByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '20');
      expect(icon).toHaveAttribute('data-color', 'bg-gray-700');
    });
  });

  describe('common icon usage patterns', () => {
    it('renders Location01Icon with custom styling', async () => {
      render(<IconComponent iconName="Location01Icon" size={16} color="white" className="mr-2" />);

      const icon = await screen.findByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '16');
      expect(icon).toHaveAttribute('data-color', 'white');
      expect(icon).toHaveClass('mr-2');
    });

    it('renders Calendar01Icon for date representation', async () => {
      render(<IconComponent iconName="Calendar01Icon" size={12} color="white" className="mr-1" />);

      const icon = await screen.findByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '12');
      expect(icon).toHaveAttribute('data-color', 'white');
    });

    it('renders Cancel01Icon', async () => {
      render(<IconComponent iconName="Cancel01Icon" size={12} color="white" />);

      expect(await screen.findByTestId('hugeicons-icon')).toBeInTheDocument();
    });
  });

  /**
   * The style is the package an icon comes from, not a prop on the icon - so a
   * variant only exists here once its package is a dependency.
   */
  describe('rendering with bulk variant', () => {
    it('renders a bulk icon', async () => {
      render(<IconComponent iconName="ShoppingBasketDone02Icon" variant="bulk" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute(
        'data-icon',
        'ShoppingBasketDone02Icon',
      );
    });

    it('returns null for a name the bulk package does not carry', async () => {
      const { container } = render(<IconComponent iconName="Calendar01Icon" variant="bulk" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });

    // Rather than quietly falling back to another style, which would draw the
    // wrong glyph and look deliberate
    it('does not fall back to another style', async () => {
      const { container } = render(<IconComponent iconName="Cancel01Icon" variant="bulk" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });

    it('takes the same size and colour as the others', async () => {
      render(
        <IconComponent
          iconName="ShoppingBasketDone02Icon"
          variant="bulk"
          size={21}
          color="currentColor"
        />,
      );

      const icon = await screen.findByTestId('hugeicons-icon');
      expect(icon).toHaveAttribute('data-size', '21');
      expect(icon).toHaveAttribute('data-color', 'currentColor');
    });
  });

  describe('rendering with duotone variant', () => {
    it('renders a duotone icon', async () => {
      render(<IconComponent iconName="CalendarAdd01Icon" variant="duotone" />);

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute(
        'data-icon',
        'CalendarAdd01Icon',
      );
    });

    it('returns null for a name the duotone package does not carry', async () => {
      const { container } = render(<IconComponent iconName="Calendar01Icon" variant="duotone" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });

    it('does not fall back to another style', async () => {
      const { container } = render(<IconComponent iconName="Cancel01Icon" variant="duotone" />);

      await flush();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('switching to an uncached icon', () => {
    it('clears the previous icon immediately rather than showing it under the new name', async () => {
      const { rerender, container } = render(<IconComponent iconName="MapPinpoint01Icon" />);
      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute(
        'data-icon',
        'MapPinpoint01Icon',
      );

      // Directions01Icon has not been loaded before in this test, so it is
      // not in the shared cache yet - the stale MapPinpoint01Icon must not
      // linger under its name while the real one loads
      rerender(<IconComponent iconName="Directions01Icon" />);
      expect(container.querySelector('[data-testid="hugeicons-icon"]')).not.toBeInTheDocument();

      expect(await screen.findByTestId('hugeicons-icon')).toHaveAttribute(
        'data-icon',
        'Directions01Icon',
      );
    });
  });
});
