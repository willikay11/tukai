import { render, screen } from '@testing-library/react';

import { PreviewCommunitySection } from './PreviewCommunitySection';

describe('PreviewCommunitySection', () => {
  it('renders section title', () => {
    render(<PreviewCommunitySection communityName={null} communityImageUrl={null} />);
    expect(screen.getByText('Host Community')).toBeInTheDocument();
  });

  it('displays "Not selected yet" when community is not provided', () => {
    render(<PreviewCommunitySection communityName={null} communityImageUrl={null} />);
    expect(screen.getByText('Not selected yet')).toBeInTheDocument();
  });

  it('displays community name when provided', () => {
    render(
      <PreviewCommunitySection
        communityName="Adventure Club"
        communityImageUrl="https://example.com/image.jpg"
      />,
    );
    expect(screen.getByText('Adventure Club')).toBeInTheDocument();
  });

  it('displays members count when provided', () => {
    render(
      <PreviewCommunitySection
        communityName="Adventure Club"
        communityImageUrl="https://example.com/image.jpg"
        communityMembersCount={5}
      />,
    );
    expect(screen.getByText('5 Experience hosted')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(
      <PreviewCommunitySection communityName={null} communityImageUrl={null} onEdit={onEdit} />,
    );
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
