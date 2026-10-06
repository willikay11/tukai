import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentDrawer } from './MomentDrawer';

jest.mock('@/components/ui/drawer', () => ({
  Drawer: ({
    isOpen,
    setIsOpen,
    children,
  }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="drawer">
        <button type="button" onClick={() => setIsOpen(false)}>
          close
        </button>
        {children}
      </div>
    ) : null,
}));

jest.mock('./MomentDetail', () => ({
  MomentDetail: ({ moment }: { moment: { id: string } }) => <div>{`detail-${moment.id}`}</div>,
}));

const moment = { id: 'm1' } as Moment;

describe('MomentDrawer', () => {
  it('shows the moment in the drawer when one is given', () => {
    render(<MomentDrawer moment={moment} onClose={jest.fn()} />);

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByText('detail-m1')).toBeInTheDocument();
  });

  it('shows nothing when no moment is selected', () => {
    render(<MomentDrawer moment={null} onClose={jest.fn()} />);

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('closes from the header close control', () => {
    const onClose = jest.fn();
    render(<MomentDrawer moment={moment} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the drawer is dismissed', () => {
    const onClose = jest.fn();
    render(<MomentDrawer moment={moment} onClose={onClose} />);

    fireEvent.click(screen.getByText('close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
