import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { MomentsShowMore } from './MomentsShowMore';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('MomentsShowMore', () => {
  it('offers the next page with a Show more button', () => {
    const onClick = jest.fn();
    render(<MomentsShowMore isLoading={false} onClick={onClick} />);

    expect(screen.getByRole('button', { name: 'Show more' })).toBeEnabled();
    expect(screen.getByTestId('ArrowDown01Icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('cannot be pressed again while the next page is in flight', () => {
    const onClick = jest.fn();
    render(<MomentsShowMore isLoading onClick={onClick} />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
