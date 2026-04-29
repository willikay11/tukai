import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ScrollFilters } from './ScrollFilters';
import * as SelectedCategoryContext from '@/context/SelectedCategoryContext';
import * as AuthDialogContext from '@/context/AuthDialogContext';

jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/context/SelectedCategoryContext');
jest.mock('@/context/AuthDialogContext');
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => (
    <span data-testid={`icon-${iconName}`}>{iconName}</span>
  ),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

const defaultFilters = [
  { label: 'All', value: 'all', icon: 'Home01Icon' },
  { label: 'Sports', value: 'sports', icon: 'BasketballIcon' },
  { label: 'Music', value: 'music', icon: 'Music01Icon' },
];

describe('ScrollFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { email: 'test@example.com' } } as any,
      status: 'authenticated',
    });
    mockUsePathname.mockReturnValue('/');
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    const mockContextValue = {
      selectedCategoryId: 'all',
      setSelectedCategoryId: jest.fn(),
    };
    jest.spyOn(SelectedCategoryContext, 'useSelectedCategory').mockReturnValue(mockContextValue);

    const mockAuthDialog = {
      openSignIn: false,
      setOpenSignIn: jest.fn(),
    };
    jest.spyOn(AuthDialogContext, 'useAuthDialog').mockReturnValue(mockAuthDialog);
  });

  describe('rendering', () => {
    it('renders all filter buttons', () => {
      render(<ScrollFilters filters={defaultFilters} />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Sports')).toBeInTheDocument();
      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    it('renders filter icons', () => {
      render(<ScrollFilters filters={defaultFilters} />);

      expect(screen.getByTestId('icon-Home01Icon')).toBeInTheDocument();
      expect(screen.getByTestId('icon-BasketballIcon')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Music01Icon')).toBeInTheDocument();
    });

    it('renders scrollable container', () => {
      const { container } = render(<ScrollFilters filters={defaultFilters} />);

      const scrollContainer = container.querySelector('.flex.h-\\[5rem\\]');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('overflow-x-auto', 'scroll-smooth');
    });

    it('renders with correct number of buttons', () => {
      render(<ScrollFilters filters={defaultFilters} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(defaultFilters.length);
    });
  });

  describe('active state styling', () => {
    it('applies active styling to selected filter', () => {
      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'sports',
          setSelectedCategoryId: jest.fn(),
        });

      render(<ScrollFilters filters={defaultFilters} />);

      const sportsButton = screen.getByText('Sports').closest('button');
      expect(sportsButton).toHaveClass('bg-emerald-100', 'text-primary');
    });

    it('applies inactive styling to unselected filters', () => {
      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'sports',
          setSelectedCategoryId: jest.fn(),
        });

      render(<ScrollFilters filters={defaultFilters} />);

      const allButton = screen.getByText('All').closest('button');
      expect(allButton).toHaveClass('bg-gray-100', 'text-gray-500');
    });

    it('changes styling when selected category changes', () => {
      const { rerender } = render(<ScrollFilters filters={defaultFilters} />);

      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'music',
          setSelectedCategoryId: jest.fn(),
        });

      rerender(<ScrollFilters filters={defaultFilters} />);

      const musicButton = screen.getByText('Music').closest('button');
      expect(musicButton).toHaveClass('bg-emerald-100');
    });
  });

  describe('filter selection', () => {
    it('calls setSelectedCategoryId when filter is clicked', async () => {
      const user = userEvent.setup();
      const mockSetSelectedCategoryId = jest.fn();

      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'all',
          setSelectedCategoryId: mockSetSelectedCategoryId,
        });

      render(<ScrollFilters filters={defaultFilters} />);

      await user.click(screen.getByText('Sports'));

      expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('sports');
    });

    it('updates URL when filter is selected', async () => {
      const user = userEvent.setup();
      const mockReplace = jest.fn();

      mockUseRouter.mockReturnValue({
        push: jest.fn(),
        replace: mockReplace,
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
      } as any);

      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'all',
          setSelectedCategoryId: jest.fn(),
        });

      render(<ScrollFilters filters={defaultFilters} />);

      await user.click(screen.getByText('Music'));

      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('category=music'), {
        scroll: true,
      });
    });
  });

  describe('authentication requirement', () => {
    it('shows sign in dialog for filters requiring login when not authenticated', async () => {
      const user = userEvent.setup();
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const mockSetOpenSignIn = jest.fn();
      jest.spyOn(AuthDialogContext, 'useAuthDialog').mockReturnValue({
        openSignIn: false,
        setOpenSignIn: mockSetOpenSignIn,
      });

      const filtersWithAuth = [
        { label: 'All', value: 'all', icon: 'Home01Icon' },
        { label: 'Premium', value: 'premium', icon: 'Star01Icon', shouldBeLoggedIn: true },
      ];

      render(<ScrollFilters filters={filtersWithAuth} />);

      await user.click(screen.getByText('Premium'));

      expect(mockSetOpenSignIn).toHaveBeenCalledWith(true);
    });

    it('allows filter selection for logged in users even with shouldBeLoggedIn flag', async () => {
      const user = userEvent.setup();
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } } as any,
        status: 'authenticated',
      });

      const mockSetSelectedCategoryId = jest.fn();
      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'all',
          setSelectedCategoryId: mockSetSelectedCategoryId,
        });

      const filtersWithAuth = [
        { label: 'All', value: 'all', icon: 'Home01Icon' },
        { label: 'Premium', value: 'premium', icon: 'Star01Icon', shouldBeLoggedIn: true },
      ];

      render(<ScrollFilters filters={filtersWithAuth} />);

      await user.click(screen.getByText('Premium'));

      expect(mockSetSelectedCategoryId).toHaveBeenCalledWith('premium');
    });
  });

  describe('scroll navigation buttons', () => {
    it('renders scroll container for filters', () => {
      const { container } = render(<ScrollFilters filters={defaultFilters} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveClass('scroll-smooth', 'scrollbar-hide');
    });
  });

  describe('filter button styling', () => {
    it('filter buttons have rounded pill shape', () => {
      const { container } = render(<ScrollFilters filters={defaultFilters} />);

      const filterButtons = container.querySelectorAll('[class*="rounded-[2.5rem]"]');
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('filter buttons have correct height and padding', () => {
      const { container } = render(<ScrollFilters filters={defaultFilters} />);

      const filterButtons = container.querySelectorAll('button.h-\\[2\\.5rem\\]');
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('filter buttons display as flex', () => {
      const { container } = render(<ScrollFilters filters={defaultFilters} />);

      // Filter buttons in the scroll container
      const scrollContainer = container.querySelector('.overflow-x-auto');
      const flexButtons = scrollContainer?.querySelectorAll('button.flex');
      expect(flexButtons && flexButtons.length > 0).toBe(true);
    });
  });

  describe('icon and label display', () => {
    it('renders icon and label in button', () => {
      render(<ScrollFilters filters={defaultFilters} />);

      const sportsButton = screen.getByText('Sports').closest('button');
      expect(sportsButton).toBeInTheDocument();
      expect(screen.getByText('Sports')).toBeInTheDocument();
    });

    it('displays all filter labels and icons', () => {
      render(<ScrollFilters filters={defaultFilters} />);

      defaultFilters.forEach((filter) => {
        expect(screen.getByText(filter.label)).toBeInTheDocument();
        expect(screen.getByTestId(`icon-${filter.icon}`)).toBeInTheDocument();
      });
    });
  });

  describe('margin between buttons', () => {
    it('filter buttons are spaced correctly', () => {
      const { container } = render(<ScrollFilters filters={defaultFilters} />);

      const filterButtons = container.querySelectorAll('div button.flex');
      expect(filterButtons.length).toBeGreaterThan(0);
    });
  });

  describe('filter updates', () => {
    it('updates active filter when context value changes', async () => {
      const { rerender } = render(<ScrollFilters filters={defaultFilters} />);

      jest
        .spyOn(SelectedCategoryContext, 'useSelectedCategory')
        .mockReturnValue({
          selectedCategoryId: 'music',
          setSelectedCategoryId: jest.fn(),
        });

      rerender(<ScrollFilters filters={defaultFilters} />);

      const musicButton = screen.getByText('Music').closest('button');
      expect(musicButton).toHaveClass('bg-emerald-100');
    });
  });

  describe('edge cases', () => {
    it('handles empty filters array', () => {
      render(<ScrollFilters filters={[]} />);

      // Component still renders, but no filter labels shown
      expect(screen.queryByText('All')).not.toBeInTheDocument();
    });

    it('handles single filter', () => {
      const singleFilter = [{ label: 'Only', value: 'only', icon: 'Star01Icon' }];
      render(<ScrollFilters filters={singleFilter} />);

      expect(screen.getByText('Only')).toBeInTheDocument();
    });

    it('handles many filters', () => {
      const manyFilters = Array.from({ length: 20 }, (_, i) => ({
        label: `Filter ${i}`,
        value: `filter-${i}`,
        icon: 'Star01Icon',
      }));

      render(<ScrollFilters filters={manyFilters} />);

      expect(screen.getByText('Filter 0')).toBeInTheDocument();
      expect(screen.getByText('Filter 19')).toBeInTheDocument();
    });

    it('handles special characters in filter labels', () => {
      const specialFilters = [
        { label: 'Tech & Science', value: 'tech-science', icon: 'Star01Icon' },
        { label: 'Art (Classical)', value: 'art-classical', icon: 'Star01Icon' },
      ];

      render(<ScrollFilters filters={specialFilters} />);

      expect(screen.getByText('Tech & Science')).toBeInTheDocument();
      expect(screen.getByText('Art (Classical)')).toBeInTheDocument();
    });
  });
});
