import React from 'react';

import { render, screen } from '@testing-library/react';

import { ImageFallback } from './ImageFallback';

describe('ImageFallback', () => {
  it('shows the broken-image icon on a muted ground', () => {
    const { container } = render(<ImageFallback />);

    expect(screen.getByTestId('ImageNotFound01Icon')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-gray-50');
  });

  // The photo is missing, not the meaning — the surrounding card or link
  // already carries the accessible name
  it('hides itself from assistive tech', () => {
    const { container } = render(<ImageFallback />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('fills the space the photo would have taken', () => {
    const { container } = render(<ImageFallback />);

    expect(container.firstChild).toHaveClass('h-full', 'w-full');
  });

  it('shows a label only when given one', () => {
    const { rerender } = render(<ImageFallback />);
    expect(screen.queryByText('Image not available')).not.toBeInTheDocument();

    rerender(<ImageFallback label="Image not available" />);
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });

  it('takes a caller shape and size', () => {
    const { container } = render(<ImageFallback className="rounded-full" iconSize={12} />);

    expect(container.firstChild).toHaveClass('rounded-full');
    expect(screen.getByTestId('ImageNotFound01Icon')).toHaveAttribute('size', '12');
  });
});
