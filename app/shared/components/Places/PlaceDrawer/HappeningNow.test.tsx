import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { HappeningNow } from './HappeningNow';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

const onNow = (id: string, title: string): Experience =>
  ({
    id,
    slug: id,
    title,
    startDate: hoursFromNow(-1),
    endDate: hoursFromNow(2),
    isPaid: true,
    priceStartsFrom: { amount: 1800, currency: 'KES' },
    hostCommunity: { id: 'c1', title: 'Nairobi Hikers' },
    photos: [],
  }) as unknown as Experience;

const over = (id: string): Experience =>
  ({
    id,
    slug: id,
    title: id,
    startDate: hoursFromNow(-5),
    endDate: hoursFromNow(-1),
    isPaid: false,
    photos: [],
  }) as unknown as Experience;

describe('HappeningNow', () => {
  it('renders nothing when nothing is on', () => {
    const { container } = render(
      <HappeningNow experiences={[over('past')]} placeTitle="Kazuri Beads" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('names the place and links each experience on now', () => {
    render(
      <HappeningNow experiences={[onNow('e1', 'Pottery Morning')]} placeTitle="Kazuri Beads" />,
    );

    expect(screen.getByRole('heading', { name: /Happening now/ })).toBeInTheDocument();
    expect(screen.getByText('Ongoing experiences at Kazuri Beads')).toBeInTheDocument();

    const card = screen.getByRole('link', { name: /Pottery Morning/ });
    expect(card).toHaveAttribute('href', '/experiences/e1');
    expect(card).toHaveTextContent('KES 1,800/person');
    expect(card).toHaveTextContent('By Nairobi Hikers');
  });

  it('leaves out the experiences that are over', () => {
    render(
      <HappeningNow
        experiences={[onNow('e1', 'Pottery Morning'), over('past')]}
        placeTitle="Kazuri Beads"
      />,
    );

    expect(screen.queryByRole('link', { name: /past/ })).not.toBeInTheDocument();
  });

  it('shows no dot pager for a single experience', () => {
    render(<HappeningNow experiences={[onNow('e1', 'Pottery Morning')]} placeTitle="Kazuri" />);

    expect(screen.queryByRole('button', { name: /Show experience/ })).not.toBeInTheDocument();
  });

  it('shows a dot per experience and marks the one in view', () => {
    render(
      <HappeningNow
        experiences={[onNow('e1', 'Pottery Morning'), onNow('e2', 'Glass Blowing')]}
        placeTitle="Kazuri"
      />,
    );

    const first = screen.getByRole('button', { name: 'Show experience 1 of 2' });
    const second = screen.getByRole('button', { name: 'Show experience 2 of 2' });

    expect(first).toHaveAttribute('aria-current', 'true');
    expect(second).not.toHaveAttribute('aria-current');

    fireEvent.click(second);

    expect(second).toHaveAttribute('aria-current', 'true');
    expect(first).not.toHaveAttribute('aria-current');
  });
});
