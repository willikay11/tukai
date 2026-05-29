import { render, screen } from '@testing-library/react';

import { PreviewCommunitySection } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewCommunitySection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(
        <PreviewCommunitySection communityName={null} communityImageUrl={null} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(<PreviewCommunitySection communityName={null} communityImageUrl={null} />);
      expect(screen.getByText('Host Community')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(
        <PreviewCommunitySection communityName={null} communityImageUrl={null} onEdit={onEdit} />,
      );
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      render(<PreviewCommunitySection communityName={null} communityImageUrl={null} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "Not selected yet" when no community', () => {
      render(<PreviewCommunitySection communityName={null} communityImageUrl={null} />);
      expect(screen.getByText('Not selected yet')).toBeInTheDocument();
    });

    it('displays "Not selected yet" when only name provided', () => {
      render(<PreviewCommunitySection communityName="Hiking Club" communityImageUrl={null} />);
      expect(screen.getByText('Not selected yet')).toBeInTheDocument();
    });
  });

  describe('Community Display', () => {
    it('displays community name and image', () => {
      render(
        <PreviewCommunitySection
          communityName="Hiking Club"
          communityImageUrl="https://example.com/hiking.jpg"
        />,
      );
      expect(screen.getByText('Hiking Club')).toBeInTheDocument();
      expect(screen.getByAltText('Hiking Club')).toBeInTheDocument();
    });

    it('displays members count when provided', () => {
      render(
        <PreviewCommunitySection
          communityName="Hiking Club"
          communityImageUrl="https://example.com/hiking.jpg"
          communityMembersCount={5}
        />,
      );
      expect(screen.getByText('5 Experience hosted')).toBeInTheDocument();
    });

    it('does not display members count when zero', () => {
      render(
        <PreviewCommunitySection
          communityName="Hiking Club"
          communityImageUrl="https://example.com/hiking.jpg"
          communityMembersCount={0}
        />,
      );
      expect(screen.queryByText(/Experience hosted/)).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewCommunitySection
          communityName="Hiking Club"
          communityImageUrl="https://example.com/hiking.jpg"
          onEdit={onEdit}
        />,
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates community when props change', () => {
      const { rerender } = render(
        <PreviewCommunitySection
          communityName="Old Club"
          communityImageUrl="https://example.com/old.jpg"
        />,
      );
      expect(screen.getByText('Old Club')).toBeInTheDocument();

      rerender(
        <PreviewCommunitySection
          communityName="New Club"
          communityImageUrl="https://example.com/new.jpg"
        />,
      );
      expect(screen.queryByText('Old Club')).not.toBeInTheDocument();
      expect(screen.getByText('New Club')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(
        <PreviewCommunitySection communityName={null} communityImageUrl={null} />,
      );
      expect(screen.getByText('Not selected yet')).toBeInTheDocument();

      rerender(
        <PreviewCommunitySection
          communityName="Hiking Club"
          communityImageUrl="https://example.com/hiking.jpg"
        />,
      );
      expect(screen.queryByText('Not selected yet')).not.toBeInTheDocument();
      expect(screen.getByText('Hiking Club')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading', () => {
      render(<PreviewCommunitySection communityName={null} communityImageUrl={null} />);
      const heading = screen.getByText('Host Community');
      expect(heading.tagName).toBe('H3');
    });

    it('image has alt text', () => {
      render(
        <PreviewCommunitySection
          communityName="Hiking Club"
          communityImageUrl="https://example.com/hiking.jpg"
        />,
      );
      const img = screen.getByAltText('Hiking Club');
      expect(img).toBeInTheDocument();
    });
  });
});
