import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BackToExplore } from './index';

const push = jest.fn();
const back = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, back }) }));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('BackToExplore', () => {
  beforeEach(() => jest.clearAllMocks());

  it('steps back through history by default', async () => {
    const user = userEvent.setup();
    render(<BackToExplore />);

    await user.click(screen.getByRole('button'));

    expect(back).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  // A breadcrumb needs a destination, not whatever the reader saw last
  it('goes somewhere specific when given an href', async () => {
    const user = userEvent.setup();
    render(<BackToExplore href="/places" label="Back to Places" />);

    await user.click(screen.getByRole('button', { name: /Back to Places/ }));

    expect(push).toHaveBeenCalledWith('/places');
    expect(back).not.toHaveBeenCalled();
  });

  // A flex item stretches to fill the cross axis, so inside a `flex-col`
  // parent — the see-all header on mobile — this spanned the full width
  it('never spans the full width of its parent', () => {
    render(<BackToExplore variant="pill" label="Back" />);

    expect(screen.getByRole('button')).toHaveClass('w-fit');
  });

  it('keeps the pill outline in the pill variant', () => {
    render(<BackToExplore variant="pill" label="Back" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-fit', 'rounded-full', 'border');
  });

  it('is a bare link by default', () => {
    render(<BackToExplore />);

    expect(screen.getByRole('button')).not.toHaveClass('rounded-full');
  });

  it('falls back to a default label', () => {
    render(<BackToExplore />);

    expect(screen.getByRole('button')).toHaveTextContent('Back to Explore');
  });
});
