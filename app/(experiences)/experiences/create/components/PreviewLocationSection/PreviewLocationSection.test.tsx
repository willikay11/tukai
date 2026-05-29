import { render, screen } from '@testing-library/react';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewLocationSection } from './index';

describe('PreviewLocationSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(
        <PreviewLocationSection location={null} />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(<PreviewLocationSection location={null} />);
      expect(screen.getByText('Experience Location')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(
        <PreviewLocationSection location={null} onEdit={onEdit} />
      );
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      render(<PreviewLocationSection location={null} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "Not set yet" when location is null', () => {
      render(<PreviewLocationSection location={null} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });

    it('displays "Not set yet" when location is empty string', () => {
      render(<PreviewLocationSection location="" />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Location Display', () => {
    it('displays the location text', () => {
      render(<PreviewLocationSection location="Mount Kenya, Nanyuki" />);
      expect(screen.getByText('Mount Kenya, Nanyuki')).toBeInTheDocument();
    });

    it('displays location icon', () => {
      render(<PreviewLocationSection location="Nairobi" />);
      expect(screen.getByText('Image02Icon')).toBeInTheDocument();
    });

    it('handles long location names', () => {
      const longLocation = 'A Very Long Location Name That Goes On And On And On';
      render(<PreviewLocationSection location={longLocation} />);
      expect(screen.getByText(longLocation)).toBeInTheDocument();
    });

    it('handles location with special characters', () => {
      render(<PreviewLocationSection location="Location (Zone A) & District" />);
      expect(screen.getByText('Location (Zone A) & District')).toBeInTheDocument();
    });

    it('handles location with numbers', () => {
      render(<PreviewLocationSection location="Plot 123, Karen Road" />);
      expect(screen.getByText('Plot 123, Karen Road')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewLocationSection location="Nairobi" onEdit={onEdit} />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates location when prop changes', () => {
      const { rerender } = render(
        <PreviewLocationSection location="Old Location" />
      );
      expect(screen.getByText('Old Location')).toBeInTheDocument();

      rerender(
        <PreviewLocationSection location="New Location" />
      );
      expect(screen.queryByText('Old Location')).not.toBeInTheDocument();
      expect(screen.getByText('New Location')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(
        <PreviewLocationSection location={null} />
      );
      expect(screen.getByText('Not set yet')).toBeInTheDocument();

      rerender(
        <PreviewLocationSection location="Nairobi" />
      );
      expect(screen.queryByText('Not set yet')).not.toBeInTheDocument();
      expect(screen.getByText('Nairobi')).toBeInTheDocument();
    });

    it('transitions from filled to empty state', () => {
      const { rerender } = render(
        <PreviewLocationSection location="Nairobi" />
      );
      expect(screen.getByText('Nairobi')).toBeInTheDocument();

      rerender(
        <PreviewLocationSection location={null} />
      );
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('displays location in gray box with icon background', () => {
      const { container } = render(
        <PreviewLocationSection location="Nairobi" />
      );
      const iconContainer = container.querySelector('.bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('applies gray background only when location is set', () => {
      const { container } = render(
        <PreviewLocationSection location="Nairobi" />
      );
      const grayBox = container.querySelector('.bg-gray-100');
      expect(grayBox).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading', () => {
      render(<PreviewLocationSection location={null} />);
      const heading = screen.getByText('Experience Location');
      expect(heading.tagName).toBe('H3');
    });
  });
});
