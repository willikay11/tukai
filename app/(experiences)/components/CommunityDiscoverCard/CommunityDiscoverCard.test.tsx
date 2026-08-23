import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityDiscoverCard } from './index';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, fallback }: Record<string, unknown>) => (
    <span data-testid="photo" data-alt={alt as string}>
      {fallback as React.ReactNode}
    </span>
  ),
}));

const useCommunityDetail = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityDetail: (id: string, enabled: boolean) => useCommunityDetail(id, enabled),
}));

const member = (id: string, name: string) => ({
  id,
  user: { id: `u-${id}`, displayName: name, picture: `https://cdn.tukai.co/${id}.jpg` },
});

const base = {
  id: 'c1',
  title: 'Nairobi Hikers',
  description: 'A crew',
  categories: [{ id: 'cat', name: 'Hiking', icon: 'Directions01Icon' }],
  photos: [],
} as unknown as Community;

const community = (extra: Record<string, unknown>) =>
  ({ ...base, ...extra }) as unknown as Community;

const facepile = (container: HTMLElement) => container.querySelector('.-space-x-2');

describe('CommunityDiscoverCard facepile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCommunityDetail.mockReturnValue({ data: undefined });
  });

  it('overlaps the first three member avatars', () => {
    const { container } = render(
      <CommunityDiscoverCard
        community={community({
          membersCount: 9,
          members: [
            member('1', 'Ann'),
            member('2', 'Ben'),
            member('3', 'Cara'),
            member('4', 'Dan'),
          ],
        })}
      />,
    );

    const pile = facepile(container);
    expect(pile).toBeInTheDocument();
    // three faces, and the overlap that makes it a stack
    expect(pile?.querySelectorAll('[data-testid="photo"]')).toHaveLength(3);
    expect(pile).toHaveClass('-space-x-2');
  });

  // The count is everyone not pictured, taken from the API total — not from the
  // handful of records the row happened to carry
  it('counts the remaining members from the API total', () => {
    const { container } = render(
      <CommunityDiscoverCard
        community={community({
          membersCount: 9,
          members: [member('1', 'Ann'), member('2', 'Ben'), member('3', 'Cara')],
        })}
      />,
    );

    expect(facepile(container)).toHaveTextContent('+6');
  });

  it('shows no overflow chip when everyone is pictured', () => {
    const { container } = render(
      <CommunityDiscoverCard
        community={community({
          membersCount: 2,
          members: [member('1', 'Ann'), member('2', 'Ben')],
        })}
      />,
    );

    expect(facepile(container)).not.toHaveTextContent('+');
  });

  // The list endpoint returns owners but no membership records
  it('falls back to the owner when no members are known', () => {
    const { container } = render(
      <CommunityDiscoverCard
        community={community({
          membersCount: 4,
          owners: [
            { id: 'o1', firstName: 'Lily', lastName: 'W', displayName: 'Lily', picture: null },
          ],
        })}
      />,
    );

    expect(facepile(container)?.querySelectorAll('[data-testid="photo"]')).toHaveLength(1);
    expect(facepile(container)).toHaveTextContent('+3');
  });

  it('uses fetched members once they arrive', () => {
    useCommunityDetail.mockReturnValue({
      data: { data: { members: [member('1', 'Ann'), member('2', 'Ben'), member('3', 'Cara')] } },
    });

    const { container } = render(
      <CommunityDiscoverCard community={community({ membersCount: 5 })} showMemberAvatars />,
    );

    expect(facepile(container)?.querySelectorAll('[data-testid="photo"]')).toHaveLength(3);
    expect(facepile(container)).toHaveTextContent('+2');
  });

  // One request per card — worth it on the grid, wasteful on the Discover row
  it('does not fetch unless asked to', () => {
    render(<CommunityDiscoverCard community={community({ membersCount: 4 })} />);

    expect(useCommunityDetail).toHaveBeenCalledWith('c1', false);
  });

  it('does not fetch when the row already carries members', () => {
    render(
      <CommunityDiscoverCard
        community={community({ members: [member('1', 'Ann')] })}
        showMemberAvatars
      />,
    );

    expect(useCommunityDetail).toHaveBeenCalledWith('c1', false);
  });

  it('hides the facepile when there is nobody to show', () => {
    const { container } = render(<CommunityDiscoverCard community={community({})} />);

    expect(facepile(container)).not.toBeInTheDocument();
  });
});
