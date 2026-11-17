import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { RecentMomentsRail } from '.';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ src }: { src: string }) => <img alt="" src={src} />,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const moment = (id: number, photoCount = 1): Moment =>
  ({
    id: String(id),
    title: '',
    description: `Caption ${id}`,
    author: { id: 'u1', firstName: 'Amina', lastName: 'Njeri', displayName: null, picture: null },
    community: null,
    experience: null,
    place: { id: 'p1', title: 'Kraftory' },
    media: Array.from({ length: photoCount }, (_, order) => ({
      id: `${id}-${order}`,
      photo: `https://cdn.tukai.co/${id}-${order}.jpg`,
      order,
    })),
    dateCreated: '2026-10-02T09:00:00Z',
  }) as unknown as Moment;

describe('RecentMomentsRail', () => {
  it('draws nothing with fewer than two moments', () => {
    const { container } = render(<RecentMomentsRail moments={[moment(1)]} onOpen={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('labels each tile and opens its moment', () => {
    const onOpen = jest.fn();
    const first = moment(1);
    render(<RecentMomentsRail moments={[first, moment(2)]} onOpen={onOpen} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Moment by Amina Njeri at Kraftory: Caption 1' }),
    );

    expect(onOpen).toHaveBeenCalledWith(first);
  });

  it('badges an album with its photo count', () => {
    render(<RecentMomentsRail moments={[moment(1, 3), moment(2)]} onOpen={jest.fn()} />);

    const album = screen.getByRole('button', { name: /^3 photos by/ });
    expect(album).toHaveTextContent('3');
  });

  it('ends in See all, leading to the Moments tab', () => {
    render(<RecentMomentsRail moments={[moment(1), moment(2)]} onOpen={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'See all moments' })).toHaveAttribute(
      'href',
      '/moments',
    );
  });

  // jsdom lays nothing out, so the rail reports it fits and the arrows that
  // could never move are left out
  it('leaves the arrows out when every column fits', () => {
    render(<RecentMomentsRail moments={[moment(1), moment(2)]} onOpen={jest.fn()} />);

    expect(screen.queryByRole('button', { name: 'Next moments' })).not.toBeInTheDocument();
  });
});
