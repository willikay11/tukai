import React from 'react';

import { render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceDetailContent } from './PlaceDetailContent';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));

jest.mock('@/app/shared/components/Images/SquarePhotoStrip', () => ({
  SquarePhotoStrip: ({ photos, variant }: { photos: string[]; variant?: string }) => (
    <div data-testid="hero" data-variant={variant}>{`photos-${photos.length}`}</div>
  ),
}));
jest.mock('@/app/shared/components/Share', () => ({ Share: () => <button>Share</button> }));
jest.mock('@/app/shared/components/Global', () => ({
  DescriptionShowMore: ({ text }: { text: string }) => <p>{text}</p>,
  GoogleMapComponent: () => <div data-testid="map" />,
}));
jest.mock('@/app/shared/components/Moments', () => ({
  MomentsMasonry: ({ moments }: { moments: unknown[] }) => <div>{`masonry-${moments.length}`}</div>,
}));
jest.mock('@/app/(places)/places/components/reviews', () => ({
  Reviews: ({ placeId }: { placeId: string }) => <div>{`reviews-${placeId}`}</div>,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

const useLocation = jest.fn();
jest.mock('@/context/LocationContext', () => ({ useLocation: () => useLocation() }));

const useExperiences = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: (params: unknown, enabled: boolean) => useExperiences(params, enabled),
}));

// The reservation panel is its own unit — stubbed here so this suite stays
// about the page
jest.mock('./ReservationPanel', () => ({
  ReservationPanel: ({ placeName }: { placeName: string }) => (
    <div data-testid="reservation-panel">{placeName}</div>
  ),
}));

const useMoments = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMoments: (params: unknown) => useMoments(params),
}));

const place = (extra: Record<string, unknown> = {}): Place =>
  ({
    id: 'p1',
    title: 'Kraftory Biergarten',
    description: 'A beer garden',
    averageRating: 4.2,
    totalReviews: 5,
    photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/a.jpg', isCover: true }],
    categories: [
      { id: 'c1', name: 'Nairobi', group: 'cities' },
      { id: 'c2', name: 'Restaurants', group: 'interests' },
    ],
    location: { city: 'Karen', point: { coordinates: [36.79, -1.22] } },
    properties: [
      { id: 'pr1', key: 'Phone Number', value: '+254 113 555777', icon: 'CallIcon' },
      { id: 'pr2', key: 'Cuisine Type', value: 'Fusion cuisine', icon: 'Dish01Icon' },
    ],
    socialLinks: [
      {
        id: 's1',
        platformName: 'Instagram',
        url: 'https://instagram.com/x',
        icon: 'InstagramIcon',
      },
    ],
    ...extra,
  }) as unknown as Place;

describe('PlaceDetailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({ lat: undefined, lng: undefined });
    useExperiences.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });
    useMoments.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });
  });

  describe('header', () => {
    it('names the place', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(
        screen.getByRole('heading', { name: 'Kraftory Biergarten', level: 1 }),
      ).toBeInTheDocument();
    });

    // Category comes from the interests group; the cities one repeats the area
    it('reads category then city', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(screen.getByText('Restaurants · Karen')).toBeInTheDocument();
    });

    // The API returns no distance — it is only known once the reader has a
    // location of their own
    it('omits the distance until the reader has a location', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(screen.queryByText(/Kms away/)).not.toBeInTheDocument();
    });

    it('shows the distance once the reader has one', () => {
      useLocation.mockReturnValue({ lat: -1.29, lng: 36.82 });

      render(<PlaceDetailContent place={place()} />);

      expect(screen.getByText(/Kms away/)).toBeInTheDocument();
    });

    // The rating also heads the Reviews section, so scope to the header
    it('shows the rating and review count', () => {
      render(<PlaceDetailContent place={place()} />);

      const header = screen.getByRole('heading', { name: 'Kraftory Biergarten' }).parentElement;
      expect(header).toHaveTextContent('4.2');
      expect(header).toHaveTextContent('(5 Reviews)');
    });

    it('hides the rating on an unrated place', () => {
      render(<PlaceDetailContent place={place({ averageRating: 0, totalReviews: null })} />);

      const header = screen.getByRole('heading', { name: 'Kraftory Biergarten' }).parentElement;
      expect(header).not.toHaveTextContent('Reviews)');
    });
  });

  // The same gallery the experience detail page uses for its hero
  it('renders the hero with the experience page’s gallery variant', () => {
    render(<PlaceDetailContent place={place()} />);

    expect(screen.getByTestId('hero')).toHaveAttribute('data-variant', 'hero');
  });

  describe('details', () => {
    // Rows are whatever the API stores, each with its own icon — not a
    // hardcoded list that would go stale
    it('renders a row per API property', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByText('Cuisine Type')).toBeInTheDocument();
      expect(screen.getByText('Fusion cuisine')).toBeInTheDocument();
    });

    it('makes the phone row dialable', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(screen.getByText('+254 113 555777').closest('a')).toHaveAttribute(
        'href',
        'tel:+254 113 555777',
      );
    });

    it('drops the section when the place has no properties', () => {
      render(<PlaceDetailContent place={place({ properties: [] })} />);

      expect(screen.queryByRole('heading', { name: 'Details' })).not.toBeInTheDocument();
    });
  });

  it('links out to each social platform', () => {
    render(<PlaceDetailContent place={place()} />);

    expect(screen.getByRole('link', { name: /Instagram/ })).toHaveAttribute(
      'href',
      'https://instagram.com/x',
    );
  });

  describe('sub-resources', () => {
    it('asks for experiences held at this place', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(useExperiences).toHaveBeenCalledWith(expect.objectContaining({ place: 'p1' }), true);
    });

    it('asks for moments at this place', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(useMoments).toHaveBeenCalledWith(expect.objectContaining({ place: 'p1' }));
    });

    it('hands the reviews list this place', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(screen.getByText('reviews-p1')).toBeInTheDocument();
    });

    // Places do have coordinates, unlike communities
    it('maps the place', () => {
      render(<PlaceDetailContent place={place()} />);

      expect(screen.getByTestId('map')).toBeInTheDocument();
    });
  });

  it('hands the reservation panel this place', () => {
    render(<PlaceDetailContent place={place()} />);

    expect(screen.getByTestId('reservation-panel')).toHaveTextContent('Kraftory Biergarten');
  });

  // Nothing links a place to a community in the API
  it('says no community is linked rather than inventing one', () => {
    render(<PlaceDetailContent place={place()} />);

    expect(screen.getByText('No community is linked to this place yet')).toBeInTheDocument();
  });
});
