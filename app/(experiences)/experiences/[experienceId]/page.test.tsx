import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render as rtlRender, screen } from '@testing-library/react';

import { fetchExperience } from '@/services/experience';

import ViewExperiencePage from './page';

// The page's client subtree (bookmark, actions) uses React Query
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: Wrapper });

// `cache` is a server-only React API — the page uses it to share one fetch
// between generateMetadata and the render. The client build jsdom loads does
// not export it, so stand it in as a pass-through.
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: unknown) => fn,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ setOpenSignIn: jest.fn(), setOpenSignUp: jest.fn() }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/experiences/123',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock dependencies
jest.mock('@/services/experience', () => ({
  fetchExperience: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

jest.mock('@/app/shared/components/Global', () => ({
  DescriptionShowMore: function MockDescriptionShowMore({
    text,
    photo,
  }: {
    text: string;
    photo: string;
  }) {
    return (
      <div data-testid="description-show-more">
        <p>{text}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="description" />
      </div>
    );
  },
  GoogleMapComponent: function MockGoogleMap({ lat, lng }: { lat: number; lng: number }) {
    return (
      <div data-testid="google-map">
        Map: {lat}, {lng}
      </div>
    );
  },
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: function MockIconComponent({
    iconName,
  }: {
    iconName: string;
    size?: number;
    color?: string;
  }) {
    return <span data-testid={`icon-${iconName}`}>{iconName}</span>;
  },
}));

jest.mock('@/app/shared/components/Share/share', () => {
  function MockShare() {
    return <button data-testid="share-button">Share</button>;
  }
  return { Share: MockShare };
});

jest.mock('@/app/shared/components/Images/SquarePhotoStrip', () => ({
  SquarePhotoStrip: ({ photos }: any) => (
    <div data-testid="photo-strip">{`${photos.length} photos`}</div>
  ),
}));

jest.mock('../components/BucketListButton', () => ({
  BucketListButton: () => <div data-testid="bucket-list-button" />,
}));

jest.mock('../components/BookingPanel', () => ({
  BookingPanel: () => <div data-testid="booking-panel" />,
}));

jest.mock('../components/ItineraryDayByDay', () => ({
  ItineraryDayByDay: () => <div data-testid="itinerary-day-by-day" />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <button data-testid="button" data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

jest.mock('../components/bookmarkExperience', () => ({
  BookmarkExperience: function MockBookmarkExperience() {
    return <button data-testid="bookmark-button">Bookmark</button>;
  },
}));

jest.mock('../components/experienceActions', () => ({
  ExperienceActions: function MockExperienceActions() {
    return <div data-testid="experience-actions">Actions</div>;
  },
}));

jest.mock('../components/experienceDetails', () => ({
  ExperienceDetails: function MockExperienceDetails() {
    return <div data-testid="experience-details">Details</div>;
  },
}));

jest.mock('../components/experienceOrganiser', () => ({
  ExperienceOrganiser: function MockExperienceOrganiser() {
    return <div data-testid="experience-organiser">Organiser</div>;
  },
}));

const mockExperienceData = {
  id: '123',
  status: 'published',
  isSoldOut: false,
  title: 'Test Experience',
  description: 'This is a test experience description',
  startDate: '2024-03-20T10:00:00Z',
  endDate: '2024-03-20T18:00:00Z',
  ticketSalesClosingDuration: 2,
  ticketSalesClosingUnit: 'hours',
  ticketSalesClosingCondition: 'before_start',
  categories: [
    { id: '1', name: 'Music', icon: 'MusicIcon' },
    { id: '2', name: 'Festival', icon: 'FestivalIcon' },
  ],
  photos: [
    { id: '1', photo: 'https://example.com/photo1.jpg', isCover: true },
    { id: '2', photo: 'https://example.com/photo2.jpg', isCover: false },
  ],
  location: {
    point: {
      coordinates: [1.2345, 6.789], // [lng, lat]
    },
  },
};

describe('ViewExperiencePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the unavailable panel when the experience cannot be shown', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: null,
    });

    const { container } = render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(container).not.toBeEmptyDOMElement();
    expect(screen.queryByText('Test Experience')).not.toBeInTheDocument();
  });

  it('should fetch experience data with correct experienceId', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(fetchExperience).toHaveBeenCalledWith('123');
  });

  it('should render experience title and dates', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByText('Test Experience')).toBeInTheDocument();
  });

  it('should render the bucket-list and share buttons', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByTestId('bucket-list-button')).toBeInTheDocument();
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
  });

  it('should hand every photo to the strip', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    const photoStrip = screen.getByTestId('photo-strip');
    expect(photoStrip).toBeInTheDocument();
    expect(photoStrip).toHaveTextContent('2 photos');
  });

  it('should render the organiser and the booking panel', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByTestId('experience-organiser')).toBeInTheDocument();
    expect(screen.getByTestId('booking-panel')).toBeInTheDocument();
  });

  it('should render all category pills with icons', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Festival')).toBeInTheDocument();
    expect(screen.getByTestId('icon-MusicIcon')).toBeInTheDocument();
    expect(screen.getByTestId('icon-FestivalIcon')).toBeInTheDocument();
  });

  it('should render "About" section with description', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByTestId('description-show-more')).toBeInTheDocument();
  });

  it('should render the booking panel', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByTestId('booking-panel')).toBeInTheDocument();
  });

  it('should render google map with correct coordinates', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    const map = screen.getByTestId('google-map');
    expect(map).toBeInTheDocument();
    expect(map).toHaveTextContent('Map: 6.789, 1.2345');
  });

  it('should render cancellation policy with "before_start" condition', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
    expect(
      screen.getByText(/Ticket sales close 2 hours before the experience starts\./),
    ).toBeInTheDocument();
  });

  it('should render cancellation policy with "before_end" condition', async () => {
    const modifiedData = {
      ...mockExperienceData,
      ticketSalesClosingCondition: 'before_end',
    };

    (fetchExperience as jest.Mock).mockResolvedValue({
      data: modifiedData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(
      screen.getByText(/Ticket sales close 2 hours before the experience ends\./),
    ).toBeInTheDocument();
  });

  it('should handle plural units correctly when duration is greater than 1', async () => {
    const modifiedData = {
      ...mockExperienceData,
      ticketSalesClosingDuration: 3,
      ticketSalesClosingUnit: 'days',
    };

    (fetchExperience as jest.Mock).mockResolvedValue({
      data: modifiedData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(
      screen.getByText('Ticket sales close 3 days before the experience starts.'),
    ).toBeInTheDocument();
  });

  it('should handle singular units correctly when duration is 1', async () => {
    const modifiedData = {
      ...mockExperienceData,
      ticketSalesClosingDuration: 1,
      ticketSalesClosingUnit: 'days',
    };

    (fetchExperience as jest.Mock).mockResolvedValue({
      data: modifiedData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(
      screen.getByText('Ticket sales close 1 day before the experience starts.'),
    ).toBeInTheDocument();
  });

  it('should render "Report this experience" button', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByText('Report this experience')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Flag02Icon')).toBeInTheDocument();
  });

  it('should render separators', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    const separators = screen.getAllByTestId('separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should use first photo as fallback when no cover photo exists', async () => {
    const modifiedData = {
      ...mockExperienceData,
      photos: [
        { id: '1', photo: 'https://example.com/photo1.jpg', isCover: false },
        { id: '2', photo: 'https://example.com/photo2.jpg', isCover: false },
      ],
    };

    (fetchExperience as jest.Mock).mockResolvedValue({
      data: modifiedData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    // Component should still render without errors
    expect(screen.getByTestId('photo-strip')).toBeInTheDocument();
  });

  it('should render main container with correct grid layout', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    const main = screen.getByRole('main');
    expect(main).toHaveClass('grid', 'grid-cols-12', 'gap-x-4');
  });
});
