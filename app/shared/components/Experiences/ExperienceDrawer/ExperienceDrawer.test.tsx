import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ExperienceDrawer } from './index';

const useFetchSingleExperience = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useFetchSingleExperience: (id: string) => useFetchSingleExperience(id),
}));

// Each of these is its own unit; this suite is about the drawer's shell
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('@/app/shared/components/Share', () => ({
  Share: () => <button type="button">share</button>,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));
jest.mock('@/app/shared/components/Moments', () => ({
  ContextMoments: () => <div data-testid="context-moments" />,
}));
jest.mock('@/app/shared/components/SendMessage/SendMessage', () => ({
  SendMessage: () => <div data-testid="send-message" />,
}));
// Its own unit (ExperienceDrawerFooter.test.tsx); this suite is about the shell
jest.mock('./ExperienceDrawerFooter', () => ({
  ExperienceDrawerFooter: () => <div data-testid="footer" />,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const experience = {
  id: 'e1',
  title: 'Pottery for beginners',
  description: 'Hands in the clay from the first hour.',
  startDate: '2026-10-03T10:00:00Z',
  endDate: '2026-10-03T12:00:00Z',
  isPaid: true,
  isBookmarked: false,
  priceStartsFrom: { amount: 1800, currency: 'KES' },
  location: { city: 'Nairobi' },
  hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' },
  photos: [
    { id: 'ph1', photo: 'https://cdn.tukai.co/cover.jpg', mediaType: 'photo', isCover: true },
  ],
};

describe('ExperienceDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchSingleExperience.mockReturnValue({
      data: { data: experience },
      isLoading: false,
      isError: false,
    });
  });

  it('fetches the experience it is given, and only while open', () => {
    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);
    expect(useFetchSingleExperience).toHaveBeenLastCalledWith('e1');

    render(<ExperienceDrawer experienceId="e1" isOpen={false} onClose={jest.fn()} />);
    expect(useFetchSingleExperience).toHaveBeenLastCalledWith('');
  });

  it('shows the title, who runs it, where, and the price', () => {
    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);

    // Host community and city repeat lower down, in the host and location
    // sections (ED-07, ED-08), so these are no longer unique to the summary
    expect(screen.getAllByText('Nairobi Makers Circle').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nairobi').length).toBeGreaterThan(0);
    expect(screen.getByText('KES 1,800/person')).toBeInTheDocument();
    expect(screen.getByText('Hands in the clay from the first hour.')).toBeInTheDocument();
  });

  // The design repeats the title, larger, at the top of the body - the
  // sticky header's copy stays, truncated, above it
  it('repeats the title in the body, below the gallery', () => {
    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);

    expect(screen.getAllByRole('heading', { name: 'Pottery for beginners' })).toHaveLength(2);
  });

  it('shows the gallery as a photo strip, not a single hero image', () => {
    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);

    expect(screen.getByAltText('Pottery for beginners photo 1')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/cover.jpg',
    );
  });

  it('clamps a long description to 3 lines behind Show more', () => {
    const longDescription = 'Clay and wheel and glaze. '.repeat(20);
    useFetchSingleExperience.mockReturnValue({
      data: { data: { ...experience, description: longDescription } },
      isLoading: false,
      isError: false,
    });

    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);

    const toggle = screen.getByRole('button', { name: /show more/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /show less/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('does not offer Show more for a description that already fits', () => {
    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
  });

  it('closes from its close control', () => {
    const onClose = jest.fn();
    render(<ExperienceDrawer experienceId="e1" isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close Pottery for beginners' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('says so when the experience cannot be loaded', () => {
    useFetchSingleExperience.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<ExperienceDrawer experienceId="e1" isOpen onClose={jest.fn()} />);

    expect(screen.getByText('This experience could not be loaded.')).toBeInTheDocument();
  });
});
