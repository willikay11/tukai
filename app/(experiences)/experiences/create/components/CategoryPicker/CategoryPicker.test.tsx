import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: jest.fn(),
}));

jest.mock('@/components/ui/categoryPill', () => ({
  CategoryPill: ({ category, isSelected, onClick }: any) => (
    <button
      onClick={onClick}
      data-testid={`category-${category.id}`}
      data-selected={isSelected}
    >
      {category.name}
    </button>
  ),
}));

import { render as rtlRender } from '@testing-library/react';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { CategoryPicker } from './index';
import type { Interest } from '@/types/interest';

const mockCategories: Interest[] = [
  { id: '1', name: 'Hiking', slug: 'hiking' },
  { id: '2', name: 'Photography', slug: 'photography' },
  { id: '3', name: 'Cooking', slug: 'cooking' },
  { id: '4', name: 'Sports', slug: 'sports' },
];

describe('CategoryPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useGetInterestCategories as jest.Mock).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('renders the component', () => {
      const onChange = jest.fn();
      const { container } = rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );
      expect(screen.getByText(/Select a category/i)).toBeInTheDocument();
    });

    it('displays loading message when loading', () => {
      (useGetInterestCategories as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
      });

      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );
      expect(screen.getByText('Loading categories...')).toBeInTheDocument();
    });

    it('renders all categories', () => {
      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Cooking')).toBeInTheDocument();
      expect(screen.getByText('Sports')).toBeInTheDocument();
    });
  });

  describe('Category Selection', () => {
    it('marks selected categories as selected', () => {
      const selectedCategories = [mockCategories[0]];
      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={selectedCategories} onChange={onChange} />
      );

      const hikingButton = screen.getByTestId('category-1');
      expect(hikingButton.getAttribute('data-selected')).toBe('true');
    });

    it('marks unselected categories as not selected', () => {
      const selectedCategories = [mockCategories[0]];
      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={selectedCategories} onChange={onChange} />
      );

      const photoButton = screen.getByTestId('category-2');
      expect(photoButton.getAttribute('data-selected')).toBe('false');
    });

    it('handles multiple selected categories', () => {
      const selectedCategories = [mockCategories[0], mockCategories[2]];
      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={selectedCategories} onChange={onChange} />
      );

      expect(screen.getByTestId('category-1').getAttribute('data-selected')).toBe('true');
      expect(screen.getByTestId('category-3').getAttribute('data-selected')).toBe('true');
      expect(screen.getByTestId('category-2').getAttribute('data-selected')).toBe('false');
    });

    it('handles empty selected categories', () => {
      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      mockCategories.forEach((cat) => {
        expect(screen.getByTestId(`category-${cat.id}`).getAttribute('data-selected')).toBe(
          'false'
        );
      });
    });
  });

  describe('User Interactions', () => {
    it('adds category when unselected category is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      const hikingButton = screen.getByTestId('category-1');
      await user.click(hikingButton);

      expect(onChange).toHaveBeenCalledWith([mockCategories[0]]);
    });

    it('removes category when selected category is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      rtlRender(
        <CategoryPicker selectedCategories={[mockCategories[0]]} onChange={onChange} />
      );

      const hikingButton = screen.getByTestId('category-1');
      await user.click(hikingButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('adds multiple categories sequentially', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const { rerender } = rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      const hikingButton = screen.getByTestId('category-1');
      await user.click(hikingButton);
      expect(onChange).toHaveBeenLastCalledWith([mockCategories[0]]);

      rerender(
        <CategoryPicker selectedCategories={[mockCategories[0]]} onChange={onChange} />
      );

      const photoButton = screen.getByTestId('category-2');
      await user.click(photoButton);
      expect(onChange).toHaveBeenLastCalledWith([mockCategories[0], mockCategories[1]]);
    });

    it('toggles category selection', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      let selectedCategories = [mockCategories[0]];

      const { rerender } = rtlRender(
        <CategoryPicker selectedCategories={selectedCategories} onChange={onChange} />
      );

      const hikingButton = screen.getByTestId('category-1');
      await user.click(hikingButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Prop Updates', () => {
    it('updates when selectedCategories prop changes', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      expect(screen.getByTestId('category-1').getAttribute('data-selected')).toBe('false');

      rerender(
        <CategoryPicker selectedCategories={[mockCategories[0]]} onChange={onChange} />
      );

      expect(screen.getByTestId('category-1').getAttribute('data-selected')).toBe('true');
    });

    it('displays new categories when hook data updates', () => {
      const onChange = jest.fn();
      const { rerender } = rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      expect(screen.getByText('Hiking')).toBeInTheDocument();

      const newCategories = [
        { id: '5', name: 'Dance', slug: 'dance' },
        { id: '6', name: 'Music', slug: 'music' },
      ];

      (useGetInterestCategories as jest.Mock).mockReturnValue({
        data: newCategories,
        isLoading: false,
      });

      rerender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
      expect(screen.getByText('Dance')).toBeInTheDocument();
      expect(screen.getByText('Music')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles no categories returned from hook', () => {
      (useGetInterestCategories as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const onChange = jest.fn();
      const { container } = rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      expect(container).toBeInTheDocument();
      expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
    });

    it('handles large number of categories', () => {
      const manyCategories = Array.from({ length: 50 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Category ${i}`,
        slug: `category-${i}`,
      }));

      (useGetInterestCategories as jest.Mock).mockReturnValue({
        data: manyCategories,
        isLoading: false,
      });

      const onChange = jest.fn();
      rtlRender(
        <CategoryPicker selectedCategories={[]} onChange={onChange} />
      );

      expect(screen.getByText('Category 0')).toBeInTheDocument();
      expect(screen.getByText('Category 49')).toBeInTheDocument();
    });
  });
});
