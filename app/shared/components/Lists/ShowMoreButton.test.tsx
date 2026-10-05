import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ShowMoreButton } from './ShowMoreButton';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('ShowMoreButton', () => {
  it('offers more while there is more to show', () => {
    const onExpand = jest.fn();
    render(<ShowMoreButton isExpanded={false} onExpand={onExpand} onCollapse={jest.fn()} />);

    expect(screen.getByText('View more')).toBeInTheDocument();
    expect(screen.getByTestId('ArrowDown01Icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onExpand).toHaveBeenCalled();
  });

  it('offers to collapse once everything is out', () => {
    const onCollapse = jest.fn();
    render(<ShowMoreButton isExpanded onExpand={jest.fn()} onCollapse={onCollapse} />);

    expect(screen.getByText('View less')).toBeInTheDocument();
    expect(screen.getByTestId('ArrowUp01Icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onCollapse).toHaveBeenCalled();
  });
});
