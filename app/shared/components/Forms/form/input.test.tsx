import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from './input';

jest.mock('@hugeicons/react-pro', () => ({
  ViewIcon: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="view-icon" onClick={onClick}>
      Show
    </button>
  ),
  ViewOffIcon: ({ onClick }: { onClick?: () => void }) => (
    <button data-testid="view-off-icon" onClick={onClick}>
      Hide
    </button>
  ),
}));

const mockIcon = <span data-testid="mock-icon">📧</span>;

const defaultProps = {
  placeholder: 'Enter text',
  type: 'text' as const,
  icon: mockIcon,
  name: 'testInput',
};

describe('Input', () => {
  describe('rendering', () => {
    it('renders input field', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with correct placeholder', () => {
      render(<Input {...defaultProps} placeholder="Enter email" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe('Enter email');
    });

    it('renders with provided icon', () => {
      render(<Input {...defaultProps} />);

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders container div with correct classes', () => {
      const { container } = render(<Input {...defaultProps} />);

      const wrapper = container.querySelector('.inline-flex');
      expect(wrapper).toHaveClass('h-[3.375rem]', 'w-full', 'rounded-[8px]', 'px-4');
    });

    it('renders with correct type text', () => {
      render(<Input {...defaultProps} type="text" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('renders with correct type password', () => {
      const { container } = render(<Input {...defaultProps} type="password" />);

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('renders with correct name attribute', () => {
      render(<Input {...defaultProps} name="emailField" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'emailField');
    });
  });

  describe('defaultValue prop', () => {
    it('renders with default value', () => {
      render(<Input {...defaultProps} defaultValue="test@example.com" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
    });

    it('renders without default value when not provided', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('password visibility toggle', () => {
    it('does not render password toggle for text input', () => {
      render(<Input {...defaultProps} type="text" />);

      expect(screen.queryByTestId('view-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('view-off-icon')).not.toBeInTheDocument();
    });

    it('renders view-off icon initially for password input', () => {
      render(<Input {...defaultProps} type="password" />);

      expect(screen.getByTestId('view-off-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('view-icon')).not.toBeInTheDocument();
    });

    it('toggles password visibility when icon is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Input {...defaultProps} type="password" />);

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');

      // Click to show password
      await user.click(screen.getByTestId('view-off-icon'));
      expect(input.type).toBe('text');

      // Click to hide password
      await user.click(screen.getByTestId('view-icon'));
      expect(input.type).toBe('password');
    });

    it('shows view icon when password is visible', async () => {
      const user = userEvent.setup();
      render(<Input {...defaultProps} type="password" />);

      await user.click(screen.getByTestId('view-off-icon'));

      expect(screen.getByTestId('view-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('view-off-icon')).not.toBeInTheDocument();
    });

    it('shows view-off icon when password is hidden', async () => {
      const user = userEvent.setup();
      render(<Input {...defaultProps} type="password" />);

      await user.click(screen.getByTestId('view-off-icon'));
      await user.click(screen.getByTestId('view-icon'));

      expect(screen.getByTestId('view-off-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('view-icon')).not.toBeInTheDocument();
    });

    it('toggles multiple times', async () => {
      const user = userEvent.setup();
      const { container } = render(<Input {...defaultProps} type="password" />);

      const input = container.querySelector('input') as HTMLInputElement;

      // Toggle 1: show
      await user.click(screen.getByTestId('view-off-icon'));
      expect(input.type).toBe('text');

      // Toggle 2: hide
      await user.click(screen.getByTestId('view-icon'));
      expect(input.type).toBe('password');

      // Toggle 3: show
      await user.click(screen.getByTestId('view-off-icon'));
      expect(input.type).toBe('text');
    });
  });

  describe('error state', () => {
    it('does not display error message when no error', () => {
      render(<Input {...defaultProps} />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('displays error message when error prop is provided', () => {
      render(<Input {...defaultProps} error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('applies error styling to container', () => {
      const { container } = render(
        <Input {...defaultProps} error="Invalid input" />
      );

      const wrapper = container.querySelector('.inline-flex');
      expect(wrapper).toHaveClass('border-red-400');
    });

    it('removes focus styling when error exists', () => {
      const { container } = render(
        <Input {...defaultProps} error="Invalid input" />
      );

      const wrapper = container.querySelector('.inline-flex');
      expect(wrapper).not.toHaveClass('hover:border-primary', 'focus:border-primary');
    });

    it('applies normal styling when no error', () => {
      const { container } = render(<Input {...defaultProps} />);

      const wrapper = container.querySelector('.inline-flex');
      expect(wrapper).toHaveClass('hover:border-primary', 'focus:border-primary');
    });

    it('error text has correct styling', () => {
      const { container } = render(
        <Input {...defaultProps} error="Field is required" />
      );

      const errorDiv = container.querySelector('.text-red-600');
      expect(errorDiv).toHaveClass('mt-1', 'text-xs');
      expect(errorDiv).toHaveTextContent('Field is required');
    });
  });

  describe('icon rendering', () => {
    it('renders custom icon provided', () => {
      const customIcon = <div data-testid="custom-icon">🔒</div>;
      render(<Input {...defaultProps} icon={customIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders icon with correct container styling', () => {
      const { container } = render(<Input {...defaultProps} />);

      const iconContainer = container.querySelector('.mr-2');
      expect(iconContainer).toHaveClass('text-gray-500');
      expect(iconContainer).toContainElement(screen.getByTestId('mock-icon'));
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to input element', () => {
      const inputRef = createRef<HTMLInputElement>();

      render(<Input {...defaultProps} refs={{ ref: inputRef }} />);

      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    });

    it('allows ref manipulation', () => {
      const inputRef = createRef<HTMLInputElement>();

      render(
        <Input
          {...defaultProps}
          defaultValue="initial"
          refs={{ ref: inputRef }}
        />
      );

      expect(inputRef.current?.value).toBe('initial');
    });
  });

  describe('input interaction', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup();
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'hello');

      expect(input.value).toBe('hello');
    });

    it('can be focused', async () => {
      const user = userEvent.setup();
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(input).toHaveFocus();
    });
  });

  describe('styling', () => {
    it('applies input-specific classes', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full', 'text-base', 'font-medium', 'outline-0');
    });

    it('applies text color classes', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-gray-500');
    });

    it('applies placeholder styling', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('placeholder:text-base');
    });

    it('applies transform and scale', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('origin-left', 'scale-[0.875]', 'transform');
    });
  });

  describe('prop combinations', () => {
    it('renders password input with error', () => {
      const { container } = render(
        <Input
          {...defaultProps}
          type="password"
          error="Password is too weak"
          defaultValue="secret123"
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
      expect(input.value).toBe('secret123');
      expect(screen.getByText('Password is too weak')).toBeInTheDocument();
    });

    it('renders text input with all props', () => {
      render(
        <Input
          placeholder="Email address"
          type="text"
          icon={<span>📧</span>}
          name="emailField"
          defaultValue="test@example.com"
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toHaveAttribute('name', 'emailField');
      expect(input).toHaveAttribute('placeholder', 'Email address');
      expect(input.value).toBe('test@example.com');
    });

    it('renders password with defaultValue and icon', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Input
          {...defaultProps}
          type="password"
          defaultValue="mypassword"
          icon={<span>🔐</span>}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('mypassword');
      expect(input.type).toBe('password');

      // Show password
      await user.click(screen.getByTestId('view-off-icon'));
      expect(input.type).toBe('text');
    });
  });
});
