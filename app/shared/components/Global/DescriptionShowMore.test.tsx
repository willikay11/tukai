'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DescriptionShowMore } from './DescriptionShowMore';

jest.mock('@/components/ui/drawer', () => ({
  Drawer: ({
    isOpen,
    setIsOpen,
    children,
  }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    children: React.ReactNode;
  }) => (
    isOpen && (
      <div data-testid="drawer" onClick={() => setIsOpen(false)}>
        {children}
      </div>
    )
  ),
}));

jest.mock('@/components/ui/image', () => ({
  TukaiImage: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => <img data-testid="tukai-image" src={src} alt={alt} className={className} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    className,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
    size?: string;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-variant={variant}
      className={className}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName, size }: { iconName: string; size: number }) => (
    <span data-testid="icon" data-icon={iconName} data-size={size}>
      {iconName}
    </span>
  ),
}));

jest.mock('sanitize-html', () => {
  return (html: string) => html;
});

const defaultProps = {
  photo: 'https://example.com/photo.jpg',
  text: 'This is a short description',
};

describe('DescriptionShowMore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.classList.remove('overflow-hidden');
  });

  describe('rendering', () => {
    it('renders text content', () => {
      render(<DescriptionShowMore {...defaultProps} />);

      expect(screen.getByText('This is a short description')).toBeInTheDocument();
    });

    it('does not show button when text is shorter than maxLength', () => {
      render(<DescriptionShowMore {...defaultProps} maxLength={100} />);

      const buttons = screen.queryAllByTestId('button');
      expect(buttons).toHaveLength(0);
    });

    it('shows button when text exceeds maxLength', () => {
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('applies font-medium class to text container', () => {
      const { container } = render(<DescriptionShowMore {...defaultProps} />);

      const textDiv = container.querySelector('.font-medium');
      expect(textDiv).toBeInTheDocument();
    });
  });

  describe('text truncation', () => {
    it('truncates text longer than maxLength', () => {
      const longText = 'A'.repeat(120);
      const { container } = render(
        <DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />
      );

      const textDiv = container.querySelector('.font-medium');
      expect(textDiv?.textContent).toHaveLength(103); // 100 + '...'
    });

    it('does not truncate text shorter than maxLength', () => {
      const text = 'Short text';
      render(<DescriptionShowMore {...defaultProps} text={text} maxLength={50} />);

      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('uses default maxLength of 100 when not provided', () => {
      const text = 'A'.repeat(150);
      const { container } = render(
        <DescriptionShowMore photo={defaultProps.photo} text={text} />
      );

      const textDiv = container.querySelector('.font-medium');
      expect(textDiv?.textContent).toHaveLength(103);
    });

    it('adds ellipsis to truncated text', () => {
      const longText = 'A'.repeat(150);
      const { container } = render(
        <DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />
      );

      const textDiv = container.querySelector('.font-medium');
      expect(textDiv?.textContent).toMatch(/\.\.\.$/);
    });

    it('respects custom maxLength', () => {
      const text = 'A'.repeat(50);
      const { container } = render(
        <DescriptionShowMore {...defaultProps} text={text} maxLength={30} />
      );

      const textDiv = container.querySelector('.font-medium');
      expect(textDiv?.textContent).toHaveLength(33); // 30 + '...'
    });
  });

  describe('Show More / Show Less button', () => {
    it('shows "Show More" button for truncated text', () => {
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });

    it('does not show button when text fits within maxLength', () => {
      render(<DescriptionShowMore {...defaultProps} maxLength={100} />);

      const showMoreButton = screen.queryByRole('button', { name: /show more/i });
      expect(showMoreButton).not.toBeInTheDocument();
    });

    it('button has link variant', () => {
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      const button = screen.getByRole('button', { name: /show more/i });
      expect(button).toHaveAttribute('data-variant', 'link');
    });

    it('button has font-bold class', () => {
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      const button = screen.getByRole('button', { name: /show more/i });
      expect(button).toHaveClass('font-bold');
    });
  });

  describe('drawer modal', () => {
    it('does not show drawer initially', () => {
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });

    it('opens drawer when Show More is clicked', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });

    it('shows full text in drawer', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      // The drawer should contain the full text
      const drawer = screen.getByTestId('drawer');
      expect(drawer.textContent).toContain('A'.repeat(150));
    });

    it('displays photo in drawer', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByTestId('tukai-image')).toHaveAttribute('src', defaultProps.photo);
    });

    it('shows About heading in drawer', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('has Close button in drawer', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('drawer toggle', () => {
    it('toggles button text from Show More to Show Less', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      const button = screen.getByRole('button', { name: /show more/i });
      await user.click(button);

      expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument();
    });

    it('closes drawer when Show Less is clicked', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      const showMoreButton = screen.getByRole('button', { name: /show more/i });
      await user.click(showMoreButton);

      expect(screen.getByTestId('drawer')).toBeInTheDocument();

      const showLessButton = screen.getByRole('button', { name: /show less/i });
      await user.click(showLessButton);

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });

    it('toggles drawer multiple times', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      const button = screen.getByRole('button', { name: /show more/i });

      // Open
      await user.click(button);
      expect(screen.getByTestId('drawer')).toBeInTheDocument();

      // Close
      await user.click(screen.getByRole('button', { name: /show less/i }));
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();

      // Open again
      await user.click(button);
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
  });

  describe('body overflow management', () => {
    it('adds overflow-hidden to body when drawer opens', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      expect(document.body.classList.contains('overflow-hidden')).toBe(false);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(document.body.classList.contains('overflow-hidden')).toBe(true);
    });

    it('removes overflow-hidden when drawer closes', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));
      expect(document.body.classList.contains('overflow-hidden')).toBe(true);

      await user.click(screen.getByRole('button', { name: /show less/i }));
      expect(document.body.classList.contains('overflow-hidden')).toBe(false);
    });

    it('cleans up overflow-hidden on unmount', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      const { unmount } = render(
        <DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />
      );

      await user.click(screen.getByRole('button', { name: /show more/i }));
      expect(document.body.classList.contains('overflow-hidden')).toBe(true);

      unmount();

      expect(document.body.classList.contains('overflow-hidden')).toBe(false);
    });
  });

  describe('close icon in drawer', () => {
    it('renders Cancel icon in close button', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('data-icon', 'Cancel01Icon');
    });

    it('close button styling includes bg-gray-800/50', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(150);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveClass('bg-gray-800/50');
    });
  });

  describe('edge cases', () => {
    it('handles text exactly at maxLength', () => {
      const text = 'A'.repeat(100);
      render(<DescriptionShowMore {...defaultProps} text={text} maxLength={100} />);

      expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
    });

    it('handles text one character over maxLength', () => {
      const text = 'A'.repeat(101);
      render(<DescriptionShowMore {...defaultProps} text={text} maxLength={100} />);

      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(10000);
      render(<DescriptionShowMore {...defaultProps} text={longText} maxLength={100} />);

      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });

    it('handles empty text', () => {
      render(<DescriptionShowMore {...defaultProps} text="" maxLength={100} />);

      expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
    });

    it('handles maxLength of 0', () => {
      const text = 'Some text';
      render(<DescriptionShowMore {...defaultProps} text={text} maxLength={0} />);

      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });
  });
});
