import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { FriendsJoinedSection, friendsJoined } from './FriendsJoinedSection';

const cardProps = jest.fn();
jest.mock('@/app/shared/components/Communities/CommunityCard', () => ({
  CommunityCard: (props: { community: Community; showFriends?: boolean }) => {
    cardProps(props);
    return <div>{`card-${props.community.title}`}</div>;
  },
}));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

const community = (id: string, friendsCount: number, membersCount = 10) =>
  ({ id, title: id, friendsCount, membersCount, friendPreviews: [] }) as unknown as Community;

// DEV-384
describe('friendsJoined', () => {
  it('keeps communities two or more friends joined, most friends first', () => {
    const picks = friendsJoined([
      community('one', 1),
      community('three', 3),
      community('two', 2),
      community('none', 0),
    ]);

    expect(picks.map((c) => c.id)).toEqual(['three', 'two']);
  });

  it('breaks a tie on members', () => {
    const picks = friendsJoined([community('small', 2, 5), community('big', 2, 500)]);

    expect(picks.map((c) => c.id)).toEqual(['big', 'small']);
  });
});

describe('FriendsJoinedSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is hidden when no community has enough friends in it', () => {
    const { container } = render(<FriendsJoinedSection communities={[community('one', 1)]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the cards with their friends', () => {
    render(<FriendsJoinedSection communities={[community('two', 2)]} />);

    expect(screen.getByRole('heading', { name: 'Your friends joined' })).toBeInTheDocument();
    expect(screen.getByText('card-two')).toBeInTheDocument();
    expect(cardProps).toHaveBeenCalledWith(expect.objectContaining({ showFriends: true }));
  });

  it('shows four, then the rest on Show more', async () => {
    render(
      <FriendsJoinedSection
        communities={['a', 'b', 'c', 'd', 'e'].map((id) => community(id, 2))}
      />,
    );

    expect(screen.queryByText('card-e')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getByText('card-e')).toBeInTheDocument();
  });
});
