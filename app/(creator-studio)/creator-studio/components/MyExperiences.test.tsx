import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { MyExperiences } from './MyExperiences';

jest.mock('next/image', () => {
  function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  function MockLink({ children, href }: Record<string, unknown>) {
    return <a href={href as string}>{children as React.ReactNode}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const experience = (id: string, title: string): Experience =>
  ({
    id,
    title,
    status: 'published',
    startDate: '2026-09-01T06:00:00Z',
    photos: [],
    ticketsSold: 4,
    totalTickets: 15,
    ticketsAvailable: 11,
  }) as unknown as Experience;

describe('MyExperiences', () => {
  it('renders a card per experience with its real sold/total', () => {
    render(<MyExperiences experiences={[experience('e1', 'Mt Kenya')]} />);

    expect(screen.getByText('Mt Kenya')).toBeInTheDocument();
    expect(screen.getByText('4/15 sold')).toBeInTheDocument();
  });

  it('links Manage to the experience dashboard', () => {
    render(<MyExperiences experiences={[experience('e1', 'Mt Kenya')]} />);

    expect(screen.getByRole('link', { name: /Manage/ })).toHaveAttribute(
      'href',
      '/creator-studio/experiences/e1',
    );
  });

  // Every published experience is listed; the studio is the full list now
  it('shows all of them and counts them, without capping to a single row', () => {
    const many = Array.from({ length: 7 }, (_, index) =>
      experience(`e${index}`, `Experience ${index}`),
    );
    render(<MyExperiences experiences={many} />);

    expect(screen.getAllByRole('link', { name: /Manage/ })).toHaveLength(7);
    expect(screen.getByText('7 published')).toBeInTheDocument();
  });

  // The hosting tab this used to point at was removed from /experiences
  it('does not offer a dead View all link', () => {
    render(<MyExperiences experiences={[experience('e1', 'Mt Kenya')]} />);

    expect(screen.queryByRole('link', { name: 'View all' })).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing is published', () => {
    render(<MyExperiences experiences={[]} />);

    expect(screen.getByText('You have no published experiences yet')).toBeInTheDocument();
  });
});
