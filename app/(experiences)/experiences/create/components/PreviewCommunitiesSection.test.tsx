import { render, screen } from '@testing-library/react';
import { PreviewCommunitiesSection } from './PreviewCommunitiesSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewCommunitiesSection', () => {
  const mockCommunities = [
    { id: 'comm-1', name: 'Photography Club', imageUrl: 'https://example.com/photo-club.jpg' },
    { id: 'comm-2', name: 'Hiking Enthusiasts', imageUrl: 'https://example.com/hiking.jpg' },
    { id: 'comm-3', name: 'Tech Meetup', imageUrl: 'https://example.com/tech.jpg' },
  ];

  it('renders community count in title', () => {
    render(
      <PreviewCommunitiesSection
        communityIds={['comm-1', 'comm-2']}
        allCommunities={mockCommunities}
      />
    );
    expect(screen.getByText('Invited Communities (2)')).toBeInTheDocument();
  });

  it('renders "No communities invited yet" when empty', () => {
    render(
      <PreviewCommunitiesSection communityIds={[]} allCommunities={mockCommunities} />
    );
    expect(screen.getByText('No communities invited yet')).toBeInTheDocument();
  });

  it('renders only invited communities', () => {
    render(
      <PreviewCommunitiesSection
        communityIds={['comm-1', 'comm-3']}
        allCommunities={mockCommunities}
      />
    );

    expect(screen.getByText('Photography Club')).toBeInTheDocument();
    expect(screen.getByText('Tech Meetup')).toBeInTheDocument();
    expect(screen.queryByText('Hiking Enthusiasts')).not.toBeInTheDocument();
  });

  it('renders community images', () => {
    render(
      <PreviewCommunitiesSection
        communityIds={['comm-1']}
        allCommunities={mockCommunities}
      />
    );

    const img = screen.getByAltText('Photography Club') as HTMLImageElement;
    expect(img).toHaveAttribute('src', 'https://example.com/photo-club.jpg');
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(
      <PreviewCommunitiesSection
        communityIds={['comm-1']}
        allCommunities={mockCommunities}
        onEdit={onEdit}
      />
    );

    const editButton = screen.getByRole('button');
    editButton.click();

    expect(onEdit).toHaveBeenCalled();
  });

  it('truncates long community names', () => {
    const longNameCommunity = [
      {
        id: 'comm-long',
        name: 'This is a very long community name that should be truncated for display purposes',
        imageUrl: 'https://example.com/long.jpg',
      },
    ];

    render(
      <PreviewCommunitiesSection
        communityIds={['comm-long']}
        allCommunities={longNameCommunity}
      />
    );

    const nameElement = screen.getByText(
      'This is a very long community name that should be truncated for display purposes'
    );
    expect(nameElement).toHaveClass('truncate');
  });
});
