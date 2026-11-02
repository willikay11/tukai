import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityDrawer } from './index';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'u1' } } }) }));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
jest.mock('@/app/shared/components/Share', () => ({
  Share: () => <button type="button">share</button>,
}));
jest.mock('@/app/shared/components/SendMessage', () => ({
  SendMessage: () => null,
}));
jest.mock('./CommunityDrawerFooter', () => ({
  CommunityDrawerFooter: () => <div data-testid="footer" />,
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const handleShare = jest.fn();
jest.mock('@/app/shared/components/Moments', () => ({
  MomentComposerForm: () => <div data-testid="moment-form" />,
  MomentComposerTrigger: ({ placeholder, onOpen }: { placeholder: string; onOpen: () => void }) => (
    <button type="button" onClick={onOpen}>
      {placeholder}
    </button>
  ),
  MomentDrawer: () => null,
  useMomentComposer: () => ({
    handleShare,
    canShare: false,
    isPending: false,
    sharedMoment: null,
    onCloseSharedMoment: jest.fn(),
  }),
}));

let communityResponse: { data: unknown } | undefined;
let isLoading = false;
let isError = false;
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityDetail: () => ({ data: communityResponse, isLoading, isError }),
}));

let experiencesResponse: { data: { results: unknown[] } } | undefined = {
  data: { results: [] },
};
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: () => ({ data: experiencesResponse, isLoading: false }),
}));

let momentsResponse: { data: { results: unknown[] } } | undefined = { data: { results: [] } };
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMoments: () => ({ data: momentsResponse, isLoading: false }),
}));

const community = (overrides: Record<string, unknown> = {}) => ({
  data: {
    id: 'c1',
    title: 'Nairobi Trail Runners',
    description: 'Weekend trail runs around the city.',
    isPublic: true,
    verified: false,
    categories: [],
    photos: [],
    location: { city: 'Nairobi' },
    members: [],
    membersCount: 3,
    ...overrides,
  },
});

const renderDrawer = () => render(<CommunityDrawer communityId="c1" isOpen onClose={jest.fn()} />);

// A week from now, so it never falls on "today" and the day-picker's own
// empty-day message renders instead of a real ExperienceCard
const inAWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

describe('CommunityDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    communityResponse = community();
    isLoading = false;
    isError = false;
    experiencesResponse = { data: { results: [] } };
    momentsResponse = { data: { results: [] } };
  });

  it('shows a loading shell while the community is on its way', () => {
    communityResponse = undefined;
    isLoading = true;
    renderDrawer();

    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('says so where the community could not be loaded', () => {
    communityResponse = undefined;
    isError = true;
    renderDrawer();

    expect(screen.getByText('This community could not be loaded.')).toBeInTheDocument();
  });

  it('marks a verified business and a private community', () => {
    communityResponse = community({ verified: true, isPublic: false });
    renderDrawer();

    expect(screen.getByLabelText('Verified business')).toBeInTheDocument();
    expect(screen.getByLabelText('Private community')).toBeInTheDocument();
  });

  it('shows About, Members and Moments by default, with no upcoming experiences', () => {
    renderDrawer();

    expect(screen.getByRole('tab', { name: /About/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Members/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Moments/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Experiences/ })).not.toBeInTheDocument();
  });

  it('adds the Experiences tab once there is an upcoming one', () => {
    experiencesResponse = { data: { results: [{ id: 'e1', startDate: inAWeek }] } };
    renderDrawer();

    expect(screen.getByRole('tab', { name: /Experiences/ })).toBeInTheDocument();
  });

  it('shows the description and the member count', () => {
    communityResponse = community({
      members: [{ id: 'm1', role: 'owner', user: { id: 'owner-1', displayName: 'Amina' } }],
    });
    renderDrawer();

    expect(screen.getByText('Weekend trail runs around the city.')).toBeInTheDocument();
    expect(screen.getByText('1 member')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('closes on the close button', async () => {
    const onClose = jest.fn();
    render(<CommunityDrawer communityId="c1" isOpen onClose={onClose} />);

    await userEvent.click(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('renders the footer once the community has loaded', () => {
    renderDrawer();

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('swaps to the moment composer for a member, and hides the footer while composing', async () => {
    communityResponse = community({
      members: [{ id: 'm1', user: { id: 'u1' }, inviteStatus: 'accepted' }],
    });
    renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'Share a moment from Nairobi Trail Runners' }),
    );

    expect(screen.getByText('New moment')).toBeInTheDocument();
    expect(screen.getByTestId('moment-form')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('toasts instead of composing for a reader who has not joined', async () => {
    renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'Share a moment from Nairobi Trail Runners' }),
    );

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('Join Nairobi Trail Runners to share moments here'),
      }),
    );
    expect(screen.queryByTestId('moment-form')).not.toBeInTheDocument();
  });
});
