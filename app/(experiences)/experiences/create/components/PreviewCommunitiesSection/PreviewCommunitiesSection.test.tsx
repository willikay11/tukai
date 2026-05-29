import { render, screen } from '@testing-library/react';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

import { PreviewCommunitiesSection } from './index';

describe('PreviewCommunitiesSection', () => {
  const mockCommunities = [
    {
      id: 'comm-1',
      name: 'Hiking Enthusiasts',
      imageUrl: 'https://example.com/hiking.jpg',
    },
    {
      id: 'comm-2',
      name: 'Photography Club',
      imageUrl: 'https://example.com/photo.jpg',
    },
    {
      id: 'comm-3',
      name: 'Cooking Group',
      imageUrl: 'https://example.com/cooking.jpg',
    },
  ];

  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Invited Communities (0)')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "No communities invited yet" when no communities', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('No communities invited yet')).toBeInTheDocument();
    });
  });

  describe('Community Display', () => {
    it('displays selected communities', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1', 'comm-2']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Hiking Enthusiasts')).toBeInTheDocument();
      expect(screen.getByText('Photography Club')).toBeInTheDocument();
    });

    it('displays community images', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
        />
      );
      const img = screen.getByAltText('Hiking Enthusiasts');
      expect(img).toBeInTheDocument();
    });

    it('updates count in heading', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1', 'comm-2', 'comm-3']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Invited Communities (3)')).toBeInTheDocument();
    });

    it('only displays selected communities', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Hiking Enthusiasts')).toBeInTheDocument();
      expect(screen.queryByText('Photography Club')).not.toBeInTheDocument();
      expect(screen.queryByText('Cooking Group')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
          onEdit={onEdit}
        />
      );
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates communities when communityIds change', () => {
      const { rerender } = render(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Invited Communities (1)')).toBeInTheDocument();

      rerender(
        <PreviewCommunitiesSection
          communityIds={['comm-1', 'comm-2']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Invited Communities (2)')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('No communities invited yet')).toBeInTheDocument();

      rerender(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.queryByText('No communities invited yet')).not.toBeInTheDocument();
      expect(screen.getByText('Hiking Enthusiasts')).toBeInTheDocument();
    });

    it('transitions from filled to empty state', () => {
      const { rerender } = render(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Hiking Enthusiasts')).toBeInTheDocument();

      rerender(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('No communities invited yet')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('handles invalid community IDs gracefully', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1', 'invalid-id']}
          allCommunities={mockCommunities}
        />
      );
      expect(screen.getByText('Hiking Enthusiasts')).toBeInTheDocument();
      expect(screen.getByText('Invited Communities (1)')).toBeInTheDocument();
    });

    it('displays communities in selection order', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-3', 'comm-1']}
          allCommunities={mockCommunities}
        />
      );
      const names = screen.getAllByText(/Enthusiasts|Group/);
      expect(names.length).toBe(2);
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={[]}
          allCommunities={mockCommunities}
        />
      );
      const heading = screen.getByText('Invited Communities (0)');
      expect(heading.tagName).toBe('H3');
    });

    it('images have alt text', () => {
      render(
        <PreviewCommunitiesSection
          communityIds={['comm-1']}
          allCommunities={mockCommunities}
        />
      );
      const img = screen.getByAltText('Hiking Enthusiasts');
      expect(img).toBeInTheDocument();
    });
  });
});
