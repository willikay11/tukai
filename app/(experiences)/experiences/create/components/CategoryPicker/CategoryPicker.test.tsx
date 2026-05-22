import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import { CategoryPicker } from './CategoryPicker';

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: jest.fn(),
}));

const mockCategoriesData = {
  data: {
    results: [
      { id: '1', name: 'Hiking' },
      { id: '2', name: 'Running' },
      { id: '3', name: 'Safari' },
    ],
  },
};

describe('CategoryPicker', () => {
  let useGetInterestCategoriesMock: jest.Mock;

  beforeEach(() => {
    const useAuth = require('@/app/shared/hooks/useAuth');
    useGetInterestCategoriesMock = useAuth.useGetInterestCategories as jest.Mock;
    useGetInterestCategoriesMock.mockReturnValue({
      data: mockCategoriesData,
      isLoading: false,
    });
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it('shows loading state while fetching', () => {
    useGetInterestCategoriesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithQueryClient(<CategoryPicker selectedCategories={[]} onChange={() => {}} />);
    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('renders categories from API', async () => {
    renderWithQueryClient(<CategoryPicker selectedCategories={[]} onChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Safari')).toBeInTheDocument();
    });
  });

  it('toggles category on click', async () => {
    const onChange = jest.fn();
    renderWithQueryClient(<CategoryPicker selectedCategories={['1']} onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('Hiking')).toBeInTheDocument();
    });
  });
});
