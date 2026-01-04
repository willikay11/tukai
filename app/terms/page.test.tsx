import { render, screen } from '@testing-library/react';

import { useTermsOfService } from '@/hooks/pages';

import TermsPage from './page';

jest.mock('@/hooks/pages', () => ({
  useTermsOfService: jest.fn(),
}));

jest.mock('@/app/components/pageLayoutContent', () => ({
  PageLayoutContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout-content">{children}</div>
  ),
}));

jest.mock('../components/form/loader', () => ({
  __esModule: true,
  default: ({ size }: { size: string }) => (
    <div data-testid="loader" data-size={size}>
      Loading...
    </div>
  ),
}));

describe('TermsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    (useTermsOfService as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<TermsPage />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveAttribute('data-size', 'large');
  });

  it('should render error state', () => {
    (useTermsOfService as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    render(<TermsPage />);

    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(
      screen.getByText('Failed to load terms of service. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('should render terms content with date modified', () => {
    const mockDate = '2024-01-15T10:00:00Z';
    const mockContent = '<h2>Terms Content</h2><p>Some terms text</p>';

    (useTermsOfService as jest.Mock).mockReturnValue({
      data: {
        content: mockContent,
        dateModified: mockDate,
      },
      isPending: false,
      isError: false,
    });

    render(<TermsPage />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(
      screen.getByText(new Date(mockDate).toLocaleDateString(), { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('Terms Content')).toBeInTheDocument();
    expect(screen.getByText('Some terms text')).toBeInTheDocument();
  });

  it('should render terms content without date modified', () => {
    const mockContent = '<h2>Terms Content</h2>';

    (useTermsOfService as jest.Mock).mockReturnValue({
      data: {
        content: mockContent,
        dateModified: undefined,
      },
      isPending: false,
      isError: false,
    });

    render(<TermsPage />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText(/-/)).toBeInTheDocument();
  });

  it('should render empty content when data is null', () => {
    (useTermsOfService as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
      isError: false,
    });

    render(<TermsPage />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });
});
