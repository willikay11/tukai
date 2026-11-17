import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentsView } from './MomentsView';

const useInfiniteMoments = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useInfiniteMoments: () => useInfiniteMoments(),
}));
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@/app/shared/components/Moments', () => ({
  MomentCard: ({ moment }: { moment: Moment }) => <article data-testid="card">{moment.id}</article>,
  MomentCardSkeleton: () => <div data-testid="skeleton" />,
  MomentDrawer: () => null,
}));
jest.mock('./hooks/usePopularRails', () => {
  const rail = (title: string) => ({
    title,
    subtitle: '',
    noun: title,
    isLoading: false,
    items: [{ id: '1', name: `${title} item`, photo: null, onOpen: () => undefined }],
  });
  return {
    usePopularRails: () => ({
      restaurants: rail('Popular restaurants'),
      communities: rail('Popular communities'),
      bucketLists: rail('Popular bucket lists'),
      experiences: rail('Popular experiences'),
    }),
  };
});
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <img alt="" />,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: () => <span />,
}));

const moments = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `m${index}`,
    media: [{ id: `md${index}`, photo: `https://cdn.tukai.co/${index}.jpg`, order: 0 }],
  }));

const feed = (count: number, overrides: Record<string, unknown> = {}) => ({
  data: { pages: [{ data: { results: moments(count) } }] },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  ...overrides,
});

describe('MomentsView', () => {
  it('shows skeleton cards while the feed loads', () => {
    useInfiniteMoments.mockReturnValue({ ...feed(0), data: undefined, isLoading: true });
    render(<MomentsView />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('invites the first moment when there are none', () => {
    useInfiniteMoments.mockReturnValue(feed(0));
    render(<MomentsView />);

    expect(screen.getByText('No moments yet. Yours could be the first.')).toBeInTheDocument();
  });

  it('offers a retry when the feed fails', () => {
    const refetch = jest.fn();
    useInfiniteMoments.mockReturnValue({ ...feed(0), data: undefined, isError: true, refetch });
    render(<MomentsView />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalled();
  });

  // Four columns until measured: blocks of 8, three blocks a page
  it('shows three blocks with a popular rail between each, in turn', () => {
    useInfiniteMoments.mockReturnValue(feed(30));
    render(<MomentsView />);

    expect(screen.getAllByTestId('card')).toHaveLength(24);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Popular restaurants', 'Popular communities']);
  });

  it('adds another page of blocks on Show more, with a rail before them', () => {
    useInfiniteMoments.mockReturnValue(feed(30));
    render(<MomentsView />);

    fireEvent.click(screen.getByRole('button', { name: /Show more/ }));

    expect(screen.getAllByTestId('card')).toHaveLength(30);
    expect(screen.getByRole('heading', { name: 'Popular bucket lists' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show more/ })).not.toBeInTheDocument();
  });

  it('reads the next API page when the blocks are not full', () => {
    const fetchNextPage = jest.fn();
    useInfiniteMoments.mockReturnValue(feed(10, { hasNextPage: true, fetchNextPage }));
    render(<MomentsView />);

    expect(fetchNextPage).toHaveBeenCalled();
  });
});
