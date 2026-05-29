import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewExcludedSection } from './index';

describe('PreviewExcludedSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<PreviewExcludedSection items={[]} />);
      expect(container).toBeInTheDocument();
    });

    it('renders the heading with icon', () => {
      const items = ['Item 1'];
      render(<PreviewExcludedSection items={items} />);
      expect(screen.getByText("What's Not Included")).toBeInTheDocument();
      expect(screen.getByText('ThumbsDownIcon')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const items = ['Item 1'];
      const onEdit = jest.fn();
      render(<PreviewExcludedSection items={items} onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      const items = ['Item 1'];
      render(<PreviewExcludedSection items={items} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "Not set yet" when no items', () => {
      render(<PreviewExcludedSection items={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });

    it('does not display heading when no items', () => {
      render(<PreviewExcludedSection items={[]} />);
      expect(screen.queryByText("What's Not Included")).not.toBeInTheDocument();
    });
  });

  describe('Item Display', () => {
    it('displays all items', () => {
      const items = ['Accommodation', 'Meals', 'Equipment'];
      render(<PreviewExcludedSection items={items} />);
      expect(screen.getByText('Accommodation')).toBeInTheDocument();
      expect(screen.getByText('Meals')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('handles single item', () => {
      const items = ['Lodging'];
      render(<PreviewExcludedSection items={items} />);
      expect(screen.getByText('Lodging')).toBeInTheDocument();
    });

    it('handles many items', () => {
      const items = Array.from({ length: 15 }, (_, i) => `Excluded Item ${i + 1}`);
      render(<PreviewExcludedSection items={items} />);
      expect(screen.getByText('Excluded Item 1')).toBeInTheDocument();
      expect(screen.getByText('Excluded Item 15')).toBeInTheDocument();
    });

    it('renders HTML content in items', () => {
      const items = ['<strong>Meals</strong>', '<em>Transportation</em>'];
      render(<PreviewExcludedSection items={items} />);
      expect(screen.getByText('Meals')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewExcludedSection items={['Item']} onEdit={onEdit} />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates items when prop changes', () => {
      const { rerender } = render(
        <PreviewExcludedSection items={['Old Item']} />
      );
      expect(screen.getByText('Old Item')).toBeInTheDocument();

      rerender(
        <PreviewExcludedSection items={['New Item 1', 'New Item 2']} />
      );
      expect(screen.queryByText('Old Item')).not.toBeInTheDocument();
      expect(screen.getByText('New Item 1')).toBeInTheDocument();
      expect(screen.getByText('New Item 2')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies red background when items present', () => {
      const { container } = render(
        <PreviewExcludedSection items={['Item']} />
      );
      const section = container.querySelector('.bg-red-50');
      expect(section).toBeInTheDocument();
    });

    it('does not apply red background when empty', () => {
      const { container } = render(
        <PreviewExcludedSection items={[]} />
      );
      const section = container.querySelector('.bg-red-50');
      expect(section).not.toBeInTheDocument();
    });
  });
});
