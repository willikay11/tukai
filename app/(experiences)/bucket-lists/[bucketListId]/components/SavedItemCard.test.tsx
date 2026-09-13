import React from 'react';

import { render, screen } from '@testing-library/react';

import { BucketListItem } from '@/types/bucket-list';

import { SavedExperienceCard, SavedPlaceCard } from './SavedItemCard';

jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback: jest.fn(), setOpenSignIn: jest.fn() }),
}));
jest.mock('@/app/shared/components/BucketList', () => ({ BucketListPicker: () => null }));

const experienceItem = (bookmark: Record<string, unknown> = {}): BucketListItem =>
  ({
    id: 'i1',
    position: 0,
    experienceBookmark: {
      id: 'b1',
      experienceId: 'exp-1',
      experienceTitle: 'Web Experience Test',
      photo: 'https://cdn.test/a.jpg',
      ...bookmark,
    },
  }) as BucketListItem;

describe('SavedExperienceCard', () => {
  /**
   * `price_starts_from` is documented as a string but comes back as
   * { amount, currency }, like every other money field. Rendering it straight
   * put an object into JSX, which React refuses — and took the whole page down
   * with "Experiences could not load".
   */
  it('reads the price out of the money object it actually gets', () => {
    render(
      <SavedExperienceCard
        item={experienceItem({ priceStartsFrom: { amount: 83, currency: 'KES' } })}
      />,
    );

    expect(screen.getByText(/KES/)).toBeInTheDocument();
    expect(screen.getByText(/83/)).toBeInTheDocument();
  });

  it('still copes with a bare string, should the API send one', () => {
    render(<SavedExperienceCard item={experienceItem({ priceStartsFrom: '83' })} />);

    expect(screen.getByText(/83/)).toBeInTheDocument();
  });

  it('says nothing about price where there is none', () => {
    render(<SavedExperienceCard item={experienceItem()} />);

    expect(screen.queryByText(/from/)).not.toBeInTheDocument();
    expect(screen.getByText('Web Experience Test')).toBeInTheDocument();
  });

  it('shows when it runs', () => {
    render(
      <SavedExperienceCard
        item={experienceItem({
          startDate: '2026-09-11T11:00:00',
          endDate: '2026-09-11T20:00:00',
        })}
      />,
    );

    expect(screen.getByText('Sep 11, 11:00 AM - 8:00 PM')).toBeInTheDocument();
  });
});

describe('SavedPlaceCard', () => {
  const placeItem = (location: unknown): BucketListItem =>
    ({
      id: 'i2',
      position: 0,
      placeBookmark: {
        id: 'pb1',
        placeId: 'place-1',
        placeName: 'Golden Star Restaurant',
        photo: 'https://cdn.test/b.jpg',
        location,
      },
    }) as BucketListItem;

  it('shows a location sent as a string', () => {
    render(<SavedPlaceCard item={placeItem('Nairobi')} />);

    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  // The same field is an object on other endpoints
  it('shows a location sent as an object', () => {
    render(<SavedPlaceCard item={placeItem({ city: 'Nairobi' })} />);

    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  it('manages without a location', () => {
    render(<SavedPlaceCard item={placeItem(undefined)} />);

    expect(screen.getByText('Golden Star Restaurant')).toBeInTheDocument();
  });
});

// Each kind keeps the shape it has on its own listing, rather than both being
// forced into one
describe('saved card shapes', () => {
  it('gives an experience the experiences listing shape', () => {
    const { container } = render(<SavedExperienceCard item={experienceItem()} />);

    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeInTheDocument();
  });

  it('gives a place the places listing shape', () => {
    const { container } = render(
      <SavedPlaceCard
        item={
          {
            id: 'i2',
            position: 0,
            placeBookmark: { id: 'pb1', placeId: 'p1', placeName: 'Golden Star' },
          } as BucketListItem
        }
      />,
    );

    expect(container.querySelector('.aspect-square')).toBeInTheDocument();
  });
});

/**
 * `photo` is a URL string on some endpoints and the Photo object on others.
 * `price_starts_from` is documented as a string and is not one, so nothing on
 * this inline is taken on trust.
 */
describe('the photo, however it arrives', () => {
  const imageIn = (container: HTMLElement) => container.querySelector('img');

  // next/image re-encodes the URL through its own optimiser in this environment
  const srcOf = (container: HTMLElement) =>
    decodeURIComponent(imageIn(container)?.getAttribute('src') ?? '');

  it('takes a plain URL', () => {
    const { container } = render(
      <SavedExperienceCard item={experienceItem({ photo: 'https://cdn.test/a.jpg' })} />,
    );

    expect(srcOf(container)).toContain('cdn.test/a.jpg');
  });

  it.each([
    ['photo', { photo: 'https://cdn.test/b.jpg' }],
    ['photoUrl', { photoUrl: 'https://cdn.test/b.jpg' }],
    ['photoWebpMdUrl', { photoWebpMdUrl: 'https://cdn.test/b.jpg' }],
  ])('takes an object carrying %s', (_label, photo) => {
    const { container } = render(<SavedExperienceCard item={experienceItem({ photo })} />);

    expect(srcOf(container)).toContain('cdn.test/b.jpg');
  });

  it('falls back rather than breaking when there is no photo at all', () => {
    const { container } = render(<SavedExperienceCard item={experienceItem({ photo: null })} />);

    expect(imageIn(container)).not.toBeInTheDocument();
    expect(screen.getByText('Web Experience Test')).toBeInTheDocument();
  });
});
