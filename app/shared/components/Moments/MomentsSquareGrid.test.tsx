import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentsSquareGrid } from './MomentsSquareGrid';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const makeMoment = (id: string, photoCount: number): Moment =>
  ({
    id,
    title: `Moment ${id}`,
    media: Array.from({ length: photoCount }, (_, index) => ({
      id: `md-${id}-${index}`,
      photo: `https://cdn.tukai.co/${id}-${index}.jpg`,
      order: index,
    })),
  }) as unknown as Moment;

describe('MomentsSquareGrid', () => {
  it('draws one named square cell per moment and reports which was pressed', () => {
    const onSelect = jest.fn();
    render(
      <MomentsSquareGrid moments={[makeMoment('a', 1), makeMoment('b', 1)]} onSelect={onSelect} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Moment b' }));

    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('shows the photo count only where a moment has more than one photo', () => {
    render(
      <MomentsSquareGrid
        moments={[makeMoment('single', 1), makeMoment('album', 4)]}
        onSelect={jest.fn()}
      />,
    );

    const album = screen.getByRole('button', { name: 'Moment album' });
    const single = screen.getByRole('button', { name: 'Moment single' });

    expect(album).toHaveTextContent('4');
    expect(album).toContainElement(screen.getByTestId('Copy01Icon'));
    expect(single).not.toHaveTextContent(/\d/);
  });

  it('leaves out a moment with no photo to show', () => {
    render(
      <MomentsSquareGrid
        moments={[{ id: 'empty', title: 'Empty', media: [] } as unknown as Moment]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
