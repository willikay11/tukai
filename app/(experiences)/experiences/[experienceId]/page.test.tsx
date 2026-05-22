import React from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { fetchExperience } from '@/services/experience';

import ViewExperiencePage from './page';

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

jest.mock('@/components/ui/PhotoGallery', () => ({
  PhotoGallery: function MockPhotoGallery({ photos }: { photos: { id: string; photo: string }[] }) {
    return <div data-testid="photo-gallery">{photos.length} photos</div>;
  },
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

  it('should render nothing when experience data is not available', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: null,
    });

    const { container } = render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(container).toBeEmptyDOMElement();
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
    expect(screen.getByText(/Mar 20, 2024 - Mar 20, 2024/)).toBeInTheDocument();
  });

  it('should render bookmark and share buttons', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByTestId('bookmark-button')).toBeInTheDocument();
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
  });

  it('should render photo gallery with correct number of photos', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    const photoGallery = screen.getByTestId('photo-gallery');
    expect(photoGallery).toBeInTheDocument();
    expect(photoGallery).toHaveTextContent('2 photos');
  });

  it('should render experience organiser and actions sections', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByTestId('experience-organiser')).toBeInTheDocument();
    expect(screen.getByTestId('experience-actions')).toBeInTheDocument();
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

  it('should render experience details component', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    expect(screen.getByTestId('experience-details')).toBeInTheDocument();
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
    expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
  });

  it('should render main container with correct grid layout', async () => {
    (fetchExperience as jest.Mock).mockResolvedValue({
      data: mockExperienceData,
    });

    render(await ViewExperiencePage({ params: { experienceId: '123' } }));

    const main = screen.getByRole('main');
    expect(main).toHaveClass('grid', 'grid-cols-12', 'gap-4');
  });
});
