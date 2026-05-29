import { render, screen } from '@testing-library/react';

import { PreviewIncludedSection } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewIncludedSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<PreviewIncludedSection items={[]} />);
      expect(container).toBeInTheDocument();
    });

    it('renders the heading with icon', () => {
      const items = ['Item 1'];
      render(<PreviewIncludedSection items={items} />);
      expect(screen.getByText("What's Included")).toBeInTheDocument();
      expect(screen.getByText('ThumbsUpIcon')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const items = ['Item 1'];
      const onEdit = jest.fn();
      render(<PreviewIncludedSection items={items} onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      const items = ['Item 1'];
      render(<PreviewIncludedSection items={items} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "Not set yet" when no items', () => {
      render(<PreviewIncludedSection items={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });

    it('does not display heading when no items', () => {
      render(<PreviewIncludedSection items={[]} />);
      expect(screen.queryByText("What's Included")).not.toBeInTheDocument();
    });
  });

  describe('Item Display', () => {
    it('displays all items', () => {
      const items = ['Guidebook', 'Transportation', 'Snacks'];
      render(<PreviewIncludedSection items={items} />);
      expect(screen.getByText('Guidebook')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Snacks')).toBeInTheDocument();
    });

    it('handles single item', () => {
      const items = ['Coffee'];
      render(<PreviewIncludedSection items={items} />);
      expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('handles many items', () => {
      const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
      render(<PreviewIncludedSection items={items} />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 20')).toBeInTheDocument();
    });

    it('handles items with special characters', () => {
      const items = ['Item & Name', 'Item <special>', 'Item (with)'];
      render(<PreviewIncludedSection items={items} />);
      expect(screen.getByText('Item & Name')).toBeInTheDocument();
    });

    it('renders HTML content in items', () => {
      const items = ['<strong>Important Item</strong>', '<em>Special Item</em>'];
      render(<PreviewIncludedSection items={items} />);
      expect(screen.getByText('Important Item')).toBeInTheDocument();
      expect(screen.getByText('Special Item')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(<PreviewIncludedSection items={['Item']} onEdit={onEdit} />);
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates items when prop changes', () => {
      const { rerender } = render(<PreviewIncludedSection items={['Old Item']} />);
      expect(screen.getByText('Old Item')).toBeInTheDocument();

      rerender(<PreviewIncludedSection items={['New Item 1', 'New Item 2']} />);
      expect(screen.queryByText('Old Item')).not.toBeInTheDocument();
      expect(screen.getByText('New Item 1')).toBeInTheDocument();
      expect(screen.getByText('New Item 2')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(<PreviewIncludedSection items={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();

      rerender(<PreviewIncludedSection items={['Item 1']} />);
      expect(screen.queryByText('Not set yet')).not.toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('transitions from filled to empty state', () => {
      const { rerender } = render(<PreviewIncludedSection items={['Item']} />);
      expect(screen.getByText('Item')).toBeInTheDocument();

      rerender(<PreviewIncludedSection items={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies emerald background when items present', () => {
      const { container } = render(<PreviewIncludedSection items={['Item']} />);
      const section = container.querySelector('.bg-emerald-50');
      expect(section).toBeInTheDocument();
    });

    it('does not apply emerald background when empty', () => {
      const { container } = render(<PreviewIncludedSection items={[]} />);
      const section = container.querySelector('.bg-emerald-50');
      expect(section).not.toBeInTheDocument();
    });
  });
});
