import { render, screen } from '@testing-library/react';
import sanitizeHtml from 'sanitize-html';

import { usePrivacyPolicy } from '@/app/(experiences)/hooks/usePages';

import PrivacyPage from './page';

jest.mock('@/hooks/pages', () => ({
  usePrivacyPolicy: jest.fn(),
}));

jest.mock('sanitize-html', () => ({
  __esModule: true,
  default: jest.fn((html) => html),
}));

jest.mock('../components/form/loader', () => ({
  __esModule: true,
  default: ({ size }: { size: string }) => <div data-testid="loader" data-size={size} />,
}));

describe('PrivacyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loader when data is pending', () => {
    (usePrivacyPolicy as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<PrivacyPage />);

    expect(screen.getByRole('region', { name: /privacy policy content/i })).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveAttribute('data-size', 'large');
  });

  it('should render error message when there is an error', () => {
    (usePrivacyPolicy as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    render(<PrivacyPage />);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/failed to load privacy policy/i)).toBeInTheDocument();
  });

  it('should render privacy policy content when data is loaded', () => {
    const mockData = {
      content: '<h1>Privacy Policy</h1><p>This is the privacy policy content.</p>',
      dateModified: '2024-01-15T00:00:00.000Z',
    };

    (usePrivacyPolicy as jest.Mock).mockReturnValue({
      data: mockData,
      isPending: false,
      isError: false,
    });

    render(<PrivacyPage />);

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/this is the privacy policy content/i)).toBeInTheDocument();
  });

  it('should render dash when dateModified is not available', () => {
    const mockData = {
      content: '<p>Privacy policy content</p>',
      dateModified: null,
    };

    (usePrivacyPolicy as jest.Mock).mockReturnValue({
      data: mockData,
      isPending: false,
      isError: false,
    });

    render(<PrivacyPage />);

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/-$/)).toBeInTheDocument();
  });

  it('should sanitize HTML content', () => {
    const mockData = {
      content: '<script>alert("xss")</script><p>Safe content</p>',
      dateModified: '2024-01-15T00:00:00.000Z',
    };

    (usePrivacyPolicy as jest.Mock).mockReturnValue({
      data: mockData,
      isPending: false,
      isError: false,
    });

    render(<PrivacyPage />);

    expect(sanitizeHtml).toHaveBeenCalledWith(mockData.content);
  });

  it('should handle null data gracefully', () => {
    (usePrivacyPolicy as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
      isError: false,
    });

    render(<PrivacyPage />);

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/-$/)).toBeInTheDocument();
  });
});
