import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ExperiencesPage } from './page';

// Mock moment to ensure consistent dates in tests
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  const mockMoment = (date?: unknown) => {
    if (date) {
      return actualMoment(date);
    }
    // Return a fixed date for consistent testing
    return actualMoment('2024-03-15T10:00:00Z');
  };
  mockMoment.format = actualMoment.format;
  mockMoment.utc = actualMoment.utc;
  mockMoment.unix = actualMoment.unix;
  mockMoment.locale = actualMoment.locale;
  mockMoment.duration = actualMoment.duration;
  mockMoment.isMoment = actualMoment.isMoment;

  return mockMoment;
});

// Mock the Experiences component
jest.mock('./components/List/experiences', () => {
  return function MockExperiences({
    category,
    title,
    date,
    isPortal,
  }: {
    category?: string;
    title?: string;
    date?: string;
    isPortal?: boolean;
  }) {
    return (
      <div data-testid="experiences-component">
        {title && <h2>{title}</h2>}
        {category && <span data-testid="category">{category}</span>}
        {date && <span data-testid="date">{date}</span>}
        {isPortal !== undefined && (
          <span data-testid="isPortal">{isPortal ? 'true' : 'false'}</span>
        )}
      </div>
    );
  };
});

describe('ExperiencesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the main container with correct structure', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('grid', 'h-full', 'grid-cols-12', 'gap-x-4', 'px-4', 'md:px-0');
  });

  it('should render three Experiences components', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const experiencesComponents = screen.getAllByTestId('experiences-component');
    expect(experiencesComponents).toHaveLength(3);
  });

  it('should render "Happening Today" section with correct date', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const todayTitle = screen.getByText(/Happening Today:/);
    expect(todayTitle).toBeInTheDocument();
    expect(todayTitle.textContent).toContain('15th March, 2024');
  });

  it('should render "Happening Tomorrow" section with correct date', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const tomorrowTitle = screen.getByText(/Happening Tomorrow:/);
    expect(tomorrowTitle).toBeInTheDocument();
    expect(tomorrowTitle.textContent).toContain('16th March, 2024');
  });

  it('should render "Discover" section', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const discoverTitle = screen.getByText('Discover');
    expect(discoverTitle).toBeInTheDocument();
  });

  it('should pass category from searchParams to all Experiences components', () => {
    const testCategory = 'music';

    // Suppress the duplicate key warning since it's expected behavior in the component,
    // but forward all other console.error calls to the original implementation.
    const originalConsoleError = console.error;
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((...args: Parameters<typeof console.error>) => {
        const [message] = args;
        if (
          typeof message === 'string' &&
          message.includes('Encountered two children with the same key')
        ) {
          return;
        }
        originalConsoleError(...args);
      });

    render(<ExperiencesPage searchParams={{ category: testCategory }} />);

    const categories = screen.getAllByTestId('category');
    expect(categories).toHaveLength(3);
    categories.forEach((category) => {
      expect(category).toHaveTextContent(testCategory);
    });

    consoleSpy.mockRestore();
  });

  it('should pass correct date to "Happening Today" component', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const dates = screen.getAllByTestId('date');
    // First component should have today's date
    expect(dates[0]).toHaveTextContent('2024-03-15');
  });

  it('should pass correct date to "Happening Tomorrow" component', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const dates = screen.getAllByTestId('date');
    // Second component should have tomorrow's date
    expect(dates[1]).toHaveTextContent('2024-03-16');
  });

  it('should set isPortal to true for date-specific sections', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const isPortalValues = screen.getAllByTestId('isPortal');
    // First two should be true (today and tomorrow)
    expect(isPortalValues[0]).toHaveTextContent('true');
    expect(isPortalValues[1]).toHaveTextContent('true');
  });

  it('should not set isPortal for "Discover" section', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const experiencesComponents = screen.getAllByTestId('experiences-component');
    // Third component (Discover) should not have isPortal
    const discoverComponent = experiencesComponents[2];
    const isPortalInDiscover = discoverComponent.querySelector('[data-testid="isPortal"]');
    expect(isPortalInDiscover).not.toBeInTheDocument();
  });

  it('should handle undefined category in searchParams', () => {
    render(<ExperiencesPage searchParams={{}} />);

    const experiencesComponents = screen.getAllByTestId('experiences-component');
    expect(experiencesComponents).toHaveLength(3);
    // Should not crash and render all components
  });
});
