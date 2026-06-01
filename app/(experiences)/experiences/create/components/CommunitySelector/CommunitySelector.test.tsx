import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { type Community, CommunitySelector } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

const mockCommunities: Community[] = [
  {
    id: 'comm-1',
    name: 'Hiking Community',
    imageUrl: 'https://example.com/hiking.jpg',
  },
  {
    id: 'comm-2',
    name: 'Photography Club',
    imageUrl: 'https://example.com/photo.jpg',
  },
  {
    id: 'comm-3',
    name: 'Cooking Enthusiasts',
    imageUrl: undefined,
  },
];

describe('CommunitySelector', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const onChange = jest.fn();
      const { container } = render(
        <CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the label', () => {
      const onChange = jest.fn();
      render(<CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />);
      expect(screen.getByText('Select Host Community')).toBeInTheDocument();
    });

    it('renders info icon', () => {
      const onChange = jest.fn();
      render(<CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />);
      expect(screen.getByText('InformationCircleIcon')).toBeInTheDocument();
    });
  });

  describe('Pill Rendering', () => {
    it('displays all communities as pills', () => {
      const onChange = jest.fn();
      render(<CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />);

      mockCommunities.forEach((community) => {
        expect(screen.getByText(community.name)).toBeInTheDocument();
      });
    });

    it('renders community images in pills', () => {
      const onChange = jest.fn();
      const { container } = render(
        <CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />,
      );

      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('shows fallback icon for communities without images', () => {
      const onChange = jest.fn();
      render(<CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />);

      const userIcons = screen.getAllByText('UserIcon');
      expect(userIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Selection', () => {
    it('calls onChange when a pill is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />);

      const pillButton = screen.getByText('Hiking Community').closest('button');
      if (pillButton) {
        await user.click(pillButton);
        expect(onChange).toHaveBeenCalledWith(mockCommunities[0]);
      }
    });

    it('highlights selected community pill', () => {
      const onChange = jest.fn();
      const { container } = render(
        <CommunitySelector
          value={mockCommunities[0]}
          communities={mockCommunities}
          onChange={onChange}
        />,
      );

      const selectedPill = screen.getByText('Hiking Community').closest('button');
      expect(selectedPill?.className).toContain('bg-primary');
      expect(selectedPill?.className).toContain('text-white');
    });

    it('toggles selection when clicking already selected pill', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const { rerender } = render(
        <CommunitySelector
          value={mockCommunities[0]}
          communities={mockCommunities}
          onChange={onChange}
        />,
      );

      const pillButton = screen.getByText('Hiking Community').closest('button');
      if (pillButton) {
        await user.click(pillButton);
        expect(onChange).toHaveBeenCalledWith(null);
      }
    });
  });

  describe('Empty State', () => {
    it('renders with empty communities list', () => {
      const onChange = jest.fn();
      const { container } = render(
        <CommunitySelector value={null} communities={[]} onChange={onChange} />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays skeleton pills when loading', () => {
      const onChange = jest.fn();
      const { container } = render(
        <CommunitySelector
          value={null}
          communities={mockCommunities}
          onChange={onChange}
          isLoading={true}
        />,
      );

      const skeletonPills = container.querySelectorAll('.animate-pulse');
      expect(skeletonPills.length).toBe(3);
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      const onChange = jest.fn();
      render(
        <CommunitySelector
          value={null}
          communities={mockCommunities}
          onChange={onChange}
          error="Please select a community"
        />,
      );
      expect(screen.getByText('Please select a community')).toBeInTheDocument();
    });

    it('shows error in red text', () => {
      const onChange = jest.fn();
      const { container } = render(
        <CommunitySelector
          value={null}
          communities={mockCommunities}
          onChange={onChange}
          error="Error"
        />,
      );

      const errorText = container.querySelector('.text-red-500');
      expect(errorText?.textContent).toContain('Error');
    });
  });

  describe('Create Community Link', () => {
    it('displays create community link when onCreateNew is provided', () => {
      const onChange = jest.fn();
      const onCreateNew = jest.fn();
      render(
        <CommunitySelector
          value={null}
          communities={mockCommunities}
          onChange={onChange}
          onCreateNew={onCreateNew}
        />,
      );

      expect(screen.getByText('Create a Community')).toBeInTheDocument();
      expect(screen.getByText('UserAdd01Icon')).toBeInTheDocument();
    });

    it('calls onCreateNew when create community link is clicked', async () => {
      const onChange = jest.fn();
      const onCreateNew = jest.fn();
      const user = userEvent.setup();
      render(
        <CommunitySelector
          value={null}
          communities={mockCommunities}
          onChange={onChange}
          onCreateNew={onCreateNew}
        />,
      );

      const createLink = screen.getByText('Create a Community').closest('button');
      if (createLink) {
        await user.click(createLink);
        expect(onCreateNew).toHaveBeenCalled();
      }
    });

    it('does not display create community link when onCreateNew is not provided', () => {
      const onChange = jest.fn();
      render(
        <CommunitySelector value={null} communities={mockCommunities} onChange={onChange} />,
      );

      expect(screen.queryByText('Create a Community')).not.toBeInTheDocument();
    });
  });
});
