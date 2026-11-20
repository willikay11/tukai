import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityRow } from './CommunityRow';

jest.mock('@/app/shared/components/Images', () => ({ PhotoImage: () => null }));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

const community = (extra: Record<string, unknown> = {}) =>
  ({
    id: 'c1',
    slug: 'hikers',
    title: 'Nairobi Hikers',
    membersCount: 40,
    ...extra,
  }) as unknown as Community;

// DEV-414: the handoff's line, from past_experiences_count
describe('CommunityRow', () => {
  it('says how many past experiences a community you run hosted', () => {
    render(<CommunityRow community={community({ pastExperiencesCount: 12 })} isOwned />);

    expect(screen.getByText('You run this, 12 past experiences hosted')).toBeInTheDocument();
  });

  it('counts one in the singular, for a community you joined', () => {
    render(<CommunityRow community={community({ pastExperiencesCount: 1 })} isOwned={false} />);

    expect(screen.getByText('1 past experience hosted')).toBeInTheDocument();
  });

  it('falls back to the member count when the response has no past count', () => {
    render(<CommunityRow community={community()} isOwned />);

    expect(screen.getByText('You run this, 40 members')).toBeInTheDocument();
  });
});
