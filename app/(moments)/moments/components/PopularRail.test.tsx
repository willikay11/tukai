import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PopularItem, PopularRail as PopularRailData } from '../hooks/usePopularRails';
import { PopularRail } from './PopularRail';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ src }: { src: string }) => <img alt="" src={src} />,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const item = (index: number, onOpen = jest.fn()): PopularItem => ({
  id: String(index),
  name: `Place ${index}`,
  photo: null,
  secondLine: 'Westlands',
  meta: { text: '4.6 · 1,204 reviews', icon: 'StarIcon', tone: 'ink' },
  onOpen,
});

const rail = (overrides: Partial<PopularRailData> = {}): PopularRailData => ({
  title: 'Popular restaurants',
  subtitle: 'Ranked by reviews from people who have been',
  noun: 'restaurants',
  items: [item(1), item(2)],
  isLoading: false,
  ...overrides,
});

describe('PopularRail', () => {
  it('shows its title, subtitle and items', () => {
    render(<PopularRail rail={rail()} />);

    expect(screen.getByRole('heading', { name: 'Popular restaurants' })).toBeInTheDocument();
    expect(screen.getByText('Ranked by reviews from people who have been')).toBeInTheDocument();
    expect(screen.getByText('Place 1')).toBeInTheDocument();
    expect(screen.getAllByText('4.6 · 1,204 reviews')).toHaveLength(2);
  });

  it('opens an item when tapped', () => {
    const onOpen = jest.fn();
    render(<PopularRail rail={rail({ items: [item(1, onOpen)] })} />);

    fireEvent.click(screen.getByRole('button', { name: /Place 1/ }));

    expect(onOpen).toHaveBeenCalled();
  });

  it('draws nothing once loaded empty', () => {
    const { container } = render(<PopularRail rail={rail({ items: [] })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('has no arrows with eight items or fewer', () => {
    render(<PopularRail rail={rail()} />);

    expect(screen.queryByRole('button', { name: 'Next restaurants' })).not.toBeInTheDocument();
  });

  it('pages eight at a time and stops at the ends', () => {
    const items = Array.from({ length: 10 }, (_, index) => item(index + 1));
    render(<PopularRail rail={rail({ items })} />);

    expect(screen.getByText('Place 8')).toBeInTheDocument();
    expect(screen.queryByText('Place 9')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous restaurants' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next restaurants' }));

    expect(screen.getByText('Place 9')).toBeInTheDocument();
    expect(screen.queryByText('Place 1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next restaurants' })).toBeDisabled();
  });
});
