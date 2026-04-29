import { render, screen } from '@testing-library/react';
import sanitizeHtml from 'sanitize-html';

import { useHelp } from '@/app/(experiences)/hooks/usePages';

import HelpPage from './page';

jest.mock('@/hooks/pages', () => ({
  useHelp: jest.fn(),
}));

jest.mock('sanitize-html', () => ({
  __esModule: true,
  default: jest.fn((html) => html),
}));

jest.mock('../components/form/loader', () => ({
  __esModule: true,
  default: ({ size }: { size: string }) => <div data-testid="loader" data-size={size} />,
}));

describe('HelpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loader when data is pending', () => {
    (useHelp as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<HelpPage />);

    expect(screen.getByRole('region', { name: /help content/i })).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveAttribute('data-size', 'large');
  });

  it('should render error message when there is an error', () => {
    (useHelp as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    render(<HelpPage />);

    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText(/failed to load help content/i)).toBeInTheDocument();
  });

  it('should render help content when data is loaded', () => {
    const mockData = {
      content: '<h2>Welcome to Help</h2><p>Some help content here.</p>',
      dateModified: '2026-01-07T12:00:00Z',
    };

    (useHelp as jest.Mock).mockReturnValue({
      data: mockData,
      isPending: false,
      isError: false,
    });

    render(<HelpPage />);

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/some help content here/i)).toBeInTheDocument();
  });

  it('should render dash when dateModified is not available', () => {
    const mockData = {
      content: '<p>Help!</p>',
      dateModified: null,
    };

    (useHelp as jest.Mock).mockReturnValue({
      data: mockData,
      isPending: false,
      isError: false,
    });

    render(<HelpPage />);

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/-$/)).toBeInTheDocument();
  });

  it('should sanitize HTML content', () => {
    const mockData = {
      content: '<script>alert("xss")</script><p>Safe content</p>',
      dateModified: '2026-01-07T12:00:00Z',
    };

    (useHelp as jest.Mock).mockReturnValue({
      data: mockData,
      isPending: false,
      isError: false,
    });

    render(<HelpPage />);

    expect(sanitizeHtml).toHaveBeenCalledWith(mockData.content);
  });

  it('should handle null data gracefully', () => {
    (useHelp as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
      isError: false,
    });

    render(<HelpPage />);

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/-$/)).toBeInTheDocument();
  });
});
