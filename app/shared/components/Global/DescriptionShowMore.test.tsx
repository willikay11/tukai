'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DescriptionShowMore } from './DescriptionShowMore';

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-variant={variant}
      className={className}
      {...rest}
    >
      {children}
    </button>
  ),
}));

jest.mock('sanitize-html', () => {
  return (html: string) => html;
});

const SHORT = 'This is a short description';
const LONG = 'a'.repeat(150);

describe('DescriptionShowMore', () => {
  describe('rendering', () => {
    it('renders text content', () => {
      render(<DescriptionShowMore text={SHORT} />);

      expect(screen.getByText(SHORT)).toBeInTheDocument();
    });

    it('does not show the button when the text fits', () => {
      render(<DescriptionShowMore text={SHORT} maxLength={100} />);

      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('shows the button when the text exceeds maxLength', () => {
      render(<DescriptionShowMore text={LONG} maxLength={100} />);

      expect(screen.getByTestId('button')).toHaveTextContent('Show More');
    });
  });

  describe('text truncation', () => {
    it('truncates text longer than maxLength', () => {
      const { container } = render(<DescriptionShowMore text={LONG} maxLength={50} />);

      expect(container.textContent).toContain('a'.repeat(50) + '...');
    });

    it('does not truncate text shorter than maxLength', () => {
      const { container } = render(<DescriptionShowMore text={SHORT} maxLength={100} />);

      expect(container.textContent).toContain(SHORT);
      expect(container.textContent).not.toContain('...');
    });

    it('defaults maxLength to 100', () => {
      const { container } = render(<DescriptionShowMore text={LONG} />);

      expect(container.textContent).toContain('a'.repeat(100) + '...');
    });
  });

  // Expanding used to open a bottom drawer, which took the reader out of the
  // page to read a paragraph
  describe('inline expansion', () => {
    it('reveals the full text in place, with no drawer or dialog', async () => {
      render(<DescriptionShowMore text={LONG} maxLength={50} />);

      await userEvent.click(screen.getByTestId('button'));

      expect(screen.getByText(LONG)).toBeInTheDocument();
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('toggles the label between Show More and Show Less', async () => {
      render(<DescriptionShowMore text={LONG} maxLength={50} />);
      const button = screen.getByTestId('button');

      expect(button).toHaveTextContent('Show More');
      await userEvent.click(button);
      expect(button).toHaveTextContent('Show Less');
      await userEvent.click(button);
      expect(button).toHaveTextContent('Show More');
    });

    it('collapses back to the truncated text', async () => {
      const { container } = render(<DescriptionShowMore text={LONG} maxLength={50} />);
      const button = screen.getByTestId('button');

      await userEvent.click(button);
      expect(container.textContent).not.toContain('...');

      await userEvent.click(button);
      expect(container.textContent).toContain('a'.repeat(50) + '...');
    });

    it('reports its expanded state to assistive tech', async () => {
      render(<DescriptionShowMore text={LONG} maxLength={50} />);
      const button = screen.getByTestId('button');

      expect(button).toHaveAttribute('aria-expanded', 'false');
      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // The drawer used to lock page scroll while open
    it('never locks body scroll', async () => {
      render(<DescriptionShowMore text={LONG} maxLength={50} />);

      await userEvent.click(screen.getByTestId('button'));

      expect(document.body).not.toHaveClass('overflow-hidden');
    });
  });

  describe('edge cases', () => {
    it('handles text exactly at maxLength', () => {
      render(<DescriptionShowMore text={'a'.repeat(50)} maxLength={50} />);

      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('handles text one character over maxLength', () => {
      render(<DescriptionShowMore text={'a'.repeat(51)} maxLength={50} />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('handles empty text', () => {
      render(<DescriptionShowMore text="" />);

      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('handles maxLength of 0', () => {
      render(<DescriptionShowMore text={SHORT} maxLength={0} />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });
});
