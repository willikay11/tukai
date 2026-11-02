import React from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityDrawer } from './index';

let sessionUserId: string | undefined = 'u1';
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: sessionUserId ? { user: { id: sessionUserId, name: 'Wanjiku Maina' } } : null,
  }),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <span role="img" aria-label={alt || undefined} />,
}));
jest.mock('@/app/shared/components/Share', () => ({
  // The content builders are plain functions; only the sheet is stood in for
  ...jest.requireActual('@/app/shared/components/Share/shareContent'),
  Share: () => <button type="button">share</button>,
}));
jest.mock('@/app/shared/components/SendMessage', () => ({
  SendMessage: () => null,
}));
jest.mock('@/app/(experiences)/components/ExperienceCard', () => ({
  ExperienceCard: ({ experience }: { experience: { title: string } }) => (
    <div data-testid="experience-card">{experience.title}</div>
  ),
}));
jest.mock('@/app/(experiences)/components/PlaceCard', () => ({
  PlaceCard: ({ place }: { place: { title: string } }) => (
    <div data-testid="place-card">{place.title}</div>
  ),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({ useAuthDialog: () => ({ needAuth }) }));

jest.mock('@/app/shared/components/Moments', () => ({
  MomentComposerForm: () => <div data-testid="moment-form" />,
  MomentDrawer: () => null,
  useMomentComposer: () => ({
    handleShare: jest.fn(),
    canShare: false,
    isPending: false,
    sharedMoment: null,
    onCloseSharedMoment: jest.fn(),
  }),
}));

let communityResponse: unknown;
let contactResponse: unknown;
let ratingsResponse: unknown;
const joinCommunity = jest.fn();
const leaveCommunity = jest.fn();
const cancelInvite = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityDetail: () => ({ data: communityResponse, isLoading: !communityResponse }),
  useCommunityContact: () => ({ data: contactResponse }),
  useCommunityRatings: () => ({ data: ratingsResponse }),
  useJoinCommunity: () => ({ mutate: joinCommunity, isPending: false }),
  useLeaveCommunity: () => ({ mutate: leaveCommunity, isPending: false }),
  useCancelCommunityInvite: () => ({ mutate: cancelInvite, isPending: false }),
}));

let experiences: unknown[] = [];
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: () => ({ data: { data: { results: experiences } }, isLoading: false }),
}));

let moments: unknown[] = [];
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMoments: () => ({ data: { data: { results: moments } }, isLoading: false }),
}));

// The scroll spy reads layout jsdom does not have; the tabs only need its shape
jest.mock('@/app/shared/hooks/useScrollSpy', () => ({
  useScrollSpy: (ids: string[]) => ({ activeId: ids[0], scrollTo: jest.fn() }),
}));

const ownerRecord = (userId = 'owner-1') => ({
  id: 'm-owner',
  role: 'owner',
  inviteStatus: 'accepted',
  user: { id: userId, displayName: 'Amina' },
});

const community = (overrides: Record<string, unknown> = {}) => ({
  success: true,
  data: {
    id: 'c1',
    title: 'Nairobi Trail Runners',
    description: 'Weekend trail runs around the city.',
    isPublic: true,
    verified: false,
    categories: [],
    photos: [],
    location: { city: 'Nairobi' },
    members: [ownerRecord()],
    membersCount: 3,
    ...overrides,
  },
});

const inAWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

const renderDrawer = (props: Partial<React.ComponentProps<typeof CommunityDrawer>> = {}) =>
  render(<CommunityDrawer communityId="c1" isOpen onClose={jest.fn()} {...props} />);

const sections = () => within(screen.getByRole('navigation', { name: 'Sections' }));

describe('CommunityDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionUserId = 'u1';
    communityResponse = community();
    contactResponse = { success: true, data: {} };
    ratingsResponse = { success: true, data: { count: 0, results: [] } };
    experiences = [];
    moments = [];
  });

  describe('the header', () => {
    it('names the community', () => {
      renderDrawer();

      expect(screen.getByRole('heading', { name: 'Nairobi Trail Runners' })).toBeInTheDocument();
    });

    it('marks a verified business with the checkmark, not the briefcase', () => {
      communityResponse = community({ verified: true });
      renderDrawer();

      const mark = screen.getByRole('img', { name: 'Verified business' });
      expect(within(mark).getByTestId('icon-CheckmarkCircle02Icon')).toBeInTheDocument();
    });

    it('offers Back only when stacked on another drawer', async () => {
      const onBack = jest.fn();
      const { rerender } = renderDrawer();
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

      rerender(<CommunityDrawer communityId="c1" isOpen onClose={jest.fn()} onBack={onBack} />);
      await userEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(onBack).toHaveBeenCalled();
    });

    it('closes on Close', async () => {
      const onClose = jest.fn();
      renderDrawer({ onClose });

      await userEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalled();
    });

    it('says so where the community could not be loaded', () => {
      communityResponse = { success: false, status: 500 };
      renderDrawer();

      expect(screen.getByText('This community could not be loaded.')).toBeInTheDocument();
    });
  });

  describe('the section tabs', () => {
    it('always offers About, Members, Moments and Reviews with its count', () => {
      ratingsResponse = { success: true, data: { count: 42, results: [] } };
      renderDrawer();

      expect(sections().getByRole('button', { name: /About/ })).toBeInTheDocument();
      expect(sections().getByRole('button', { name: /Members/ })).toBeInTheDocument();
      expect(sections().getByRole('button', { name: /Moments/ })).toBeInTheDocument();
      expect(sections().getByRole('button', { name: 'Reviews (42)' })).toBeInTheDocument();
      expect(sections().queryByRole('button', { name: /Experiences/ })).not.toBeInTheDocument();
      expect(sections().queryByRole('button', { name: /Places/ })).not.toBeInTheDocument();
    });

    it('marks the current one as the reader’s location', () => {
      renderDrawer();

      expect(sections().getByRole('button', { name: /About/ })).toHaveAttribute(
        'aria-current',
        'location',
      );
    });

    it('adds Experiences and Places once there is something upcoming somewhere', () => {
      experiences = [
        {
          id: 'e1',
          title: 'Ngong Hills hike',
          startDate: inAWeek,
          endDate: inAWeek,
          place: { id: 'p1', title: 'Ngong Hills' },
        },
      ];
      renderDrawer();

      expect(sections().getByRole('button', { name: /Experiences/ })).toBeInTheDocument();
      expect(sections().getByRole('button', { name: /Places/ })).toBeInTheDocument();
      expect(screen.getByText('Places Nairobi Trail Runners meets at')).toBeInTheDocument();
    });
  });

  describe('the full view', () => {
    it('shows the city chip and the about text', () => {
      renderDrawer();

      expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
      expect(screen.getByText('Weekend trail runs around the city.')).toBeInTheDocument();
    });

    it('shows a verified business’s own places, counted on its chip', () => {
      communityResponse = community({
        verified: true,
        verifiedPlaces: [{ id: 'p1', title: 'Courtyard Studio' }],
      });
      renderDrawer();

      expect(
        screen.getByRole('button', { name: 'Verified business, owns 1 place. Show places' }),
      ).toBeInTheDocument();
      expect(screen.getByText('1 place owned by Nairobi Trail Runners')).toBeInTheDocument();
      expect(screen.getByTestId('place-card')).toHaveTextContent('Courtyard Studio');
    });

    it('hides contact details and socials when the community has none', () => {
      renderDrawer();

      expect(screen.queryByText('Phone number')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Socials' })).not.toBeInTheDocument();
    });

    it('shows the phone, email and socials it has', () => {
      contactResponse = {
        success: true,
        data: {
          contactPhone: '+254 712 345 678',
          contactEmail: 'runners@gmail.com',
          instagramUrl: 'https://instagram.com/runners',
        },
      };
      renderDrawer();

      expect(screen.getByRole('link', { name: '+254 712 345 678' })).toHaveAttribute(
        'href',
        'tel:+254712345678',
      );
      expect(screen.getByRole('link', { name: 'runners@gmail.com' })).toHaveAttribute(
        'href',
        'mailto:runners@gmail.com',
      );
      expect(screen.getByRole('link', { name: /Instagram/ })).toHaveAttribute('target', '_blank');
      expect(screen.queryByRole('link', { name: /WhatsApp/ })).not.toBeInTheDocument();
    });

    it('counts the members and labels the admin', () => {
      renderDrawer();

      expect(screen.getByText('3 members')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('counts the past experiences the admin has organised', () => {
      experiences = [{ id: 'e0', title: 'Karura loop', startDate: lastMonth, endDate: lastMonth }];
      renderDrawer();

      expect(screen.getByText('1 past experience organised')).toBeInTheDocument();
    });

    it('names the experience a review is of, with the average and count', () => {
      experiences = [{ id: 'e0', title: 'Karura loop', startDate: lastMonth, endDate: lastMonth }];
      ratingsResponse = {
        success: true,
        data: {
          count: 2,
          results: [
            {
              id: 'r1',
              experience: 'e0',
              attendee: { displayName: 'Kevo' },
              rating: 5,
              review: 'Great pace.',
              dateCreated: '2026-09-12T00:00:00Z',
            },
            {
              id: 'r2',
              experience: 'e0',
              attendee: { displayName: 'Njeri' },
              rating: 4,
              dateCreated: '2026-08-01T00:00:00Z',
            },
          ],
        },
      };
      renderDrawer();

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('2 reviews')).toBeInTheDocument();
      expect(screen.getAllByText('Karura loop').length).toBeGreaterThan(0);
      expect(screen.getByText('Great pace.')).toBeInTheDocument();
      expect(screen.getByText('September 2026')).toBeInTheDocument();
    });

    it('says so when there are no reviews yet', () => {
      renderDrawer();

      expect(
        screen.getByText('No reviews yet. If you have been, yours would be the first.'),
      ).toBeInTheDocument();
    });
  });

  describe('the action bar', () => {
    it('offers Join community to a guest, and joins at once', async () => {
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

      expect(joinCommunity).toHaveBeenCalledWith('c1', expect.anything());
    });

    it('asks a signed-out reader to sign up first', async () => {
      sessionUserId = undefined;
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

      expect(needAuth).toHaveBeenCalledWith('join', expect.any(Function));
      expect(joinCommunity).not.toHaveBeenCalled();
    });

    it('offers Message host and Leave community to a member', async () => {
      communityResponse = community({
        members: [
          ownerRecord(),
          { id: 'm1', role: 'regular', inviteStatus: 'accepted', user: { id: 'u1' } },
        ],
      });
      renderDrawer();

      expect(screen.getAllByRole('button', { name: /Message host/ }).length).toBeGreaterThan(0);
      await userEvent.click(screen.getByRole('button', { name: 'Leave community' }));

      expect(leaveCommunity).toHaveBeenCalledWith({ communityId: 'c1' }, expect.anything());
    });

    it('offers Message members, and no Leave, to the owner', () => {
      communityResponse = community({ members: [ownerRecord('u1')] });
      renderDrawer();

      expect(screen.getAllByRole('button', { name: /Message members/ }).length).toBeGreaterThan(0);
      expect(screen.queryByRole('button', { name: 'Leave community' })).not.toBeInTheDocument();
    });
  });

  describe('sharing a moment', () => {
    it('opens the composer for a member', async () => {
      communityResponse = community({
        members: [
          ownerRecord(),
          { id: 'm1', role: 'regular', inviteStatus: 'accepted', user: { id: 'u1' } },
        ],
      });
      renderDrawer();

      await userEvent.click(
        screen.getByRole('button', { name: 'Share a moment from Nairobi Trail Runners' }),
      );

      expect(screen.getByText('New moment')).toBeInTheDocument();
      expect(screen.getByTestId('moment-form')).toBeInTheDocument();
    });

    it('tells anyone else that joining comes first', async () => {
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Share moment' }));

      expect(toast).toHaveBeenCalledWith({
        description: 'Join Nairobi Trail Runners to share moments here. Joining is instant.',
      });
      expect(screen.queryByTestId('moment-form')).not.toBeInTheDocument();
    });

    it('asks a signed-out reader to sign up', async () => {
      sessionUserId = undefined;
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Share moment' }));

      expect(needAuth).toHaveBeenCalledWith('moment');
    });
  });

  describe('owners and pending invites', () => {
    it('lists invites nobody has accepted, and cancels one', async () => {
      communityResponse = community({
        members: [
          ownerRecord('u1'),
          {
            id: 'm2',
            role: 'regular',
            inviteStatus: 'pending',
            user: { id: 'u2', displayName: 'Baraka' },
          },
        ],
      });
      renderDrawer();

      expect(screen.getByText('Invited, not joined yet')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Cancel the invite to Baraka' }));

      expect(cancelInvite).toHaveBeenCalledWith(
        { communityId: 'c1', userId: 'u2' },
        expect.anything(),
      );
    });

    it('keeps them from everyone else', () => {
      communityResponse = community({
        members: [
          ownerRecord(),
          {
            id: 'm2',
            role: 'regular',
            inviteStatus: 'pending',
            user: { id: 'u2', displayName: 'Baraka' },
          },
        ],
      });
      renderDrawer();

      expect(screen.queryByText('Invited, not joined yet')).not.toBeInTheDocument();
    });
  });

  describe('a private community', () => {
    it('shows an invitee the invited state, with no tabs, Share or action bar', () => {
      communityResponse = community({
        isPublic: false,
        members: [
          ownerRecord(),
          { id: 'm1', role: 'regular', inviteStatus: 'pending', user: { id: 'u1' } },
        ],
      });
      renderDrawer();

      expect(screen.getByText('Amina invited you to this private community')).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Sections' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'share' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Share moment' })).not.toBeInTheDocument();
    });

    it('turns into the closed state when the invite is declined', async () => {
      communityResponse = community({
        isPublic: false,
        members: [
          ownerRecord(),
          { id: 'm1', role: 'regular', inviteStatus: 'pending', user: { id: 'u1' } },
        ],
      });
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Decline invite' }));

      expect(screen.getByText('This community is private')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Private community' })).toBeInTheDocument();
    });

    it('joins from the invite', async () => {
      communityResponse = community({
        isPublic: false,
        members: [
          ownerRecord(),
          { id: 'm1', role: 'regular', inviteStatus: 'pending', user: { id: 'u1' } },
        ],
      });
      renderDrawer();

      await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

      expect(joinCommunity).toHaveBeenCalledWith('c1', expect.anything());
    });

    it('shows anyone else the closed state, without its name', () => {
      communityResponse = community({ isPublic: false });
      renderDrawer();

      expect(screen.getByText('This community is private')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Private community' })).toBeInTheDocument();
      expect(screen.queryByText('Nairobi Trail Runners')).not.toBeInTheDocument();
    });

    it('shows the closed state where the API refuses the community', () => {
      communityResponse = { success: false, status: 403 };
      renderDrawer();

      expect(screen.getByText('This community is private')).toBeInTheDocument();
    });

    it('shows a member the full view, with the lock', () => {
      communityResponse = community({
        isPublic: false,
        members: [
          ownerRecord(),
          { id: 'm1', role: 'regular', inviteStatus: 'accepted', user: { id: 'u1' } },
        ],
      });
      renderDrawer();

      expect(screen.getByRole('img', { name: 'Private community' })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    });
  });
});
