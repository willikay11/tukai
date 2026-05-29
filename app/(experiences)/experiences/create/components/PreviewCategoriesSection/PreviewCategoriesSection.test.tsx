import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewCategoriesSection } from './index';
import type { Interest } from '@/types/interest';

describe('PreviewCategoriesSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<PreviewCategoriesSection categories={[]} />);
      expect(container).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(<PreviewCategoriesSection categories={[]} />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(<PreviewCategoriesSection categories={[]} onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      render(<PreviewCategoriesSection categories={[]} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "Not set yet" when no categories', () => {
      render(<PreviewCategoriesSection categories={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Category Display', () => {
    const categories: Interest[] = [
      { id: '1', name: 'Hiking', slug: 'hiking' },
      { id: '2', name: 'Photography', slug: 'photography' },
      { id: '3', name: 'Cooking', slug: 'cooking' },
    ];

    it('displays all categories', () => {
      render(<PreviewCategoriesSection categories={categories} />);
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Cooking')).toBeInTheDocument();
    });

    it('displays category with icon when icon is provided', () => {
      const categoriesWithIcons: Interest[] = [
        { id: '1', name: 'Hiking', slug: 'hiking', icon: 'Mountain' },
      ];
      render(<PreviewCategoriesSection categories={categoriesWithIcons} />);
      expect(screen.getByText('Mountain')).toBeInTheDocument();
      expect(screen.getByText('Hiking')).toBeInTheDocument();
    });

    it('displays category without icon when icon is not provided', () => {
      const categories: Interest[] = [
        { id: '1', name: 'Hiking', slug: 'hiking' },
      ];
      render(<PreviewCategoriesSection categories={categories} />);
      expect(screen.getByText('Hiking')).toBeInTheDocument();
    });

    it('handles single category', () => {
      const singleCategory: Interest[] = [
        { id: '1', name: 'Hiking', slug: 'hiking' },
      ];
      render(<PreviewCategoriesSection categories={singleCategory} />);
      expect(screen.getByText('Hiking')).toBeInTheDocument();
    });

    it('handles many categories', () => {
      const manyCategories: Interest[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `Category ${i}`,
        slug: `category-${i}`,
      }));
      render(<PreviewCategoriesSection categories={manyCategories} />);
      expect(screen.getByText('Category 0')).toBeInTheDocument();
      expect(screen.getByText('Category 9')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewCategoriesSection
          categories={[{ id: '1', name: 'Hiking', slug: 'hiking' }]}
          onEdit={onEdit}
        />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates categories when prop changes', () => {
      const { rerender } = render(
        <PreviewCategoriesSection
          categories={[{ id: '1', name: 'Hiking', slug: 'hiking' }]}
        />
      );
      expect(screen.getByText('Hiking')).toBeInTheDocument();

      rerender(
        <PreviewCategoriesSection
          categories={[
            { id: '2', name: 'Photography', slug: 'photography' },
            { id: '3', name: 'Cooking', slug: 'cooking' },
          ]}
        />
      );
      expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Cooking')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(<PreviewCategoriesSection categories={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();

      rerender(
        <PreviewCategoriesSection
          categories={[{ id: '1', name: 'Hiking', slug: 'hiking' }]}
        />
      );
      expect(screen.queryByText('Not set yet')).not.toBeInTheDocument();
      expect(screen.getByText('Hiking')).toBeInTheDocument();
    });

    it('transitions from filled to empty state', () => {
      const { rerender } = render(
        <PreviewCategoriesSection
          categories={[{ id: '1', name: 'Hiking', slug: 'hiking' }]}
        />
      );
      expect(screen.getByText('Hiking')).toBeInTheDocument();

      rerender(<PreviewCategoriesSection categories={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading', () => {
      render(<PreviewCategoriesSection categories={[]} />);
      const heading = screen.getByText('Categories');
      expect(heading.tagName).toBe('H3');
    });

    it('edit button is accessible', () => {
      const onEdit = jest.fn();
      render(
        <PreviewCategoriesSection
          categories={[{ id: '1', name: 'Hiking', slug: 'hiking' }]}
          onEdit={onEdit}
        />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      expect(editButton).toBeInTheDocument();
    });
  });
});
