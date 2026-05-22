import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './button';

jest.mock('@/app/shared/components/Forms/form/loader', () => ({
  Loader: ({ size }: { size: string }) => (
    <div data-testid="loader" data-size={size}>
      Loading
    </div>
  ),
}));

describe('Button', () => {
  describe('rendering', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('renders as button element by default', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders with correct default type attribute', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('htmlType prop', () => {
    it('sets type to submit when htmlType is submit', () => {
      render(<Button htmlType="submit">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('sets type to reset when htmlType is reset', () => {
      render(<Button htmlType="reset">Reset</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('sets type to button when htmlType is button', () => {
      render(<Button htmlType="button">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('type (styling) prop', () => {
    it('applies primary styling by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'font-medium', 'text-white');
    });

    it('applies primary styling when type is primary', () => {
      render(<Button type="primary">Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'font-medium', 'text-white');
    });

    it('applies blue styling when type is blue', () => {
      render(<Button type="blue">Blue</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'text-white');
    });

    it('applies link styling when type is link', () => {
      render(<Button type="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'px-0', 'py-0', 'text-primary');
    });

    it('does not apply blue styling to non-blue buttons', () => {
      render(<Button type="primary">Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('bg-blue-500');
    });
  });

  describe('size prop', () => {
    it('applies normal size classes by default', () => {
      render(<Button>Normal</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-5');
    });

    it('applies normal size classes when size is normal', () => {
      render(<Button size="normal">Normal</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-5');
    });

    it('applies small size classes when size is small', () => {
      render(<Button size="small">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('py-2');
    });

    it('applies large size classes when size is large', () => {
      render(<Button size="large">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('py-5', 'py-2');
    });

    it('does not apply size classes to link buttons', () => {
      render(
        <Button type="link" size="normal">
          Link
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('py-5', 'py-2');
    });
  });

  describe('block prop', () => {
    it('does not apply full width by default', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('applies full width when block is true', () => {
      render(<Button block={true}>Block</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not apply padding-x when block is true', () => {
      render(<Button block={true}>Block</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('px-3');
    });

    it('applies padding-x when block is false and not link type', () => {
      render(
        <Button block={false} type="primary">
          Normal
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
    });

    it('does not apply padding-x to link type buttons', () => {
      render(<Button type="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('px-3');
    });
  });

  describe('loading state', () => {
    it('shows loader when loading is true', () => {
      render(<Button loading={true}>Submit</Button>);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('does not show loader when loading is false', () => {
      render(<Button loading={false}>Submit</Button>);

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('shows children text when loading is true', () => {
      render(<Button loading={true}>Submit</Button>);

      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('passes small size to loader', () => {
      render(<Button loading={true}>Loading...</Button>);

      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('data-size', 'small');
    });

    it('disables button when loading is true', () => {
      render(<Button loading={true}>Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('wraps content in flex container when loading', () => {
      const { container } = render(<Button loading={true}>Submit</Button>);

      const flexContainer = container.querySelector('div.flex');
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('items-center', 'justify-center', 'space-x-2');
    });

    it('sets aria-label on loading div', () => {
      const { container } = render(<Button loading={true}>Submit</Button>);

      const statusDiv = container.querySelector('[role="status"]');
      expect(statusDiv).toHaveAttribute('aria-label', 'Loading...');
    });
  });

  describe('disabled prop', () => {
    it('disables button when disabled is true', () => {
      render(<Button disabled={true}>Click</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('enables button when disabled is false', () => {
      render(<Button disabled={false}>Click</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('disables button when loading is true (loading takes precedence)', () => {
      render(
        <Button loading={true} disabled={false}>
          Submit
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button when both loading and disabled are true', () => {
      render(
        <Button loading={true} disabled={true}>
          Submit
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('onClick handler', () => {
    it('calls onClick when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} disabled={true}>
          Click
        </Button>,
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading is true', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} loading={true}>
          Click
        </Button>,
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('styling classes', () => {
    it('applies inline-flex and justify-center', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex', 'justify-center');
    });

    it('applies rounded-[8px]', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-[8px]');
    });

    it('applies text-xs', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-xs');
    });
  });

  describe('prop combinations', () => {
    it('renders link button with block', () => {
      render(
        <Button type="link" block={true}>
          Link Button
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full', 'text-primary');
      expect(button).not.toHaveClass('py-5', 'px-3');
    });

    it('renders small blue button', () => {
      render(
        <Button type="blue" size="small">
          Small Blue
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'py-2');
    });

    it('renders submit button with loading state', () => {
      render(
        <Button htmlType="submit" loading={true}>
          Submitting
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders full width primary button with custom handler', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button type="primary" block={true} onClick={handleClick}>
          Full Width
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'w-full');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
