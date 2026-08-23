import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { CommunityDetailContent } from './CommunityDetailContent';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: jest.fn() }),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, fallback }: Record<string, unknown>) => (
    <span data-testid="photo">{fallback as React.ReactNode}</span>
  ),
}));
jest.mock('@/app/shared/components/Images/SquarePhotoStrip', () => ({
  SquarePhotoStrip: ({ photos }: { photos: string[] }) => <div>{`strip-${photos.length}`}</div>,
}));
jest.mock('@/app/shared/components/Share', () => ({
  Share: () => <button type="button">Share</button>,
}));
jest.mock('@/app/shared/components/Moments', () => ({
  MomentsMasonry: ({ moments }: { moments: unknown[] }) => <div>{`masonry-${moments.length}`}</div>,
}));

const scrollTo = jest.fn();
const useScrollSpy = jest.fn();
jest.mock('@/app/shared/hooks/useScrollSpy', () => ({
  useScrollSpy: (ids: string[], offset?: number) => useScrollSpy(ids, offset),
}));

const useExperiences = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: (params: unknown, enabled: boolean) => useExperiences(params, enabled),
}));

const useMoments = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMoments: (params: unknown) => useMoments(params),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useJoinCommunity: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

const community = (extra: Record<string, unknown> = {}): Community =>
  ({
    id: 'c1',
    title: 'Nairobi Hikers',
    description: 'A crew that walks',
    isPublic: true,
    photos: [{ id: 'p1', photo: 'https://cdn.tukai.co/a.jpg', isCover: true }],
    categories: [{ id: 'cat', name: 'Hiking', icon: 'Directions01Icon' }],
    members: [
      { id: 'm1', role: 'owner', user: { id: 'u1', displayName: 'Lily', picture: null } },
      { id: 'm2', role: 'regular', user: { id: 'u2', displayName: 'Ben', picture: null } },
    ],
    membersCount: 12,
    ...extra,
  }) as unknown as Community;

const renderPage = (extra: Record<string, unknown> = {}, userId = 'someone-else') =>
  render(<CommunityDetailContent community={community(extra)} currentUserId={userId} />);

describe('CommunityDetailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useScrollSpy.mockReturnValue({ activeId: 'about', scrollTo });
    useExperiences.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });
    useMoments.mockReturnValue({ data: { data: { results: [] } }, isLoading: false });
  });

  describe('header', () => {
    it('names the community', () => {
      renderPage();

      expect(screen.getByRole('heading', { name: 'Nairobi Hikers', level: 1 })).toBeInTheDocument();
    });

    it('says whether it is public or private', () => {
      renderPage();
      expect(screen.getByText('Public community')).toBeInTheDocument();
    });

    it('marks a private community', () => {
      renderPage({ isPublic: false });
      expect(screen.getByText('Private community')).toBeInTheDocument();
    });
  });

  describe('anchor tabs', () => {
    it('offers one tab per section', () => {
      renderPage();

      ['About', 'Experiences', 'Members', 'Places', 'Moments', 'Reviews'].forEach((label) => {
        expect(screen.getByRole('tab', { name: new RegExp(label) })).toBeInTheDocument();
      });
    });

    it('marks the section the reader is in', () => {
      useScrollSpy.mockReturnValue({ activeId: 'members', scrollTo });

      renderPage();

      expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'About' })).toHaveAttribute('aria-selected', 'false');
    });

    // In-page anchors, not routes — picking one scrolls rather than navigates
    it('scrolls to a section instead of navigating', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('tab', { name: /Moments/ }));

      expect(scrollTo).toHaveBeenCalledWith('moments');
      expect(push).not.toHaveBeenCalled();
    });

    // Pills, not underlined tabs — the active one takes a green ground and
    // brand-coloured label
    it('fills the pill for the section being read', () => {
      useScrollSpy.mockReturnValue({ activeId: 'members', scrollTo });

      renderPage();

      const active = screen.getByRole('tab', { name: /Members/ });
      expect(active).toHaveClass('bg-green-200', 'text-primary');

      const inactive = screen.getByRole('tab', { name: /About/ });
      expect(inactive).toHaveClass('bg-gray-100');
      expect(inactive).not.toHaveClass('bg-green-200');
    });

    // The icon mock exposes the Hugeicons name it was handed as the testid
    it('gives every pill its own icon', () => {
      renderPage();

      const expected: Record<string, string> = {
        About: 'InformationCircleIcon',
        Experiences: 'Ticket02Icon',
        Members: 'UserGroupIcon',
        Places: 'Location01Icon',
        Moments: 'Camera01Icon',
        Reviews: 'StarIcon',
      };

      Object.entries(expected).forEach(([label, icon]) => {
        const pill = screen.getByRole('tab', { name: new RegExp(label) });
        expect(pill.querySelector(`[data-testid="${icon}"]`)).toBeInTheDocument();
      });
    });

    it('watches every section', () => {
      renderPage();

      expect(useScrollSpy).toHaveBeenCalledWith(
        ['about', 'experiences', 'members', 'places', 'moments', 'reviews'],
        undefined,
      );
    });
  });

  describe('sections', () => {
    // The About section leads with its photos; the pill already labels it
    it('does not repeat an About heading', () => {
      renderPage();

      expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument();
    });

    it('shows the community photos as a hero strip', () => {
      renderPage();

      expect(screen.getByText('strip-1')).toBeInTheDocument();
    });

    it('renders all six, each anchored', () => {
      const { container } = renderPage();

      ['about', 'experiences', 'members', 'places', 'moments', 'reviews'].forEach((id) => {
        expect(container.querySelector(`section#${id}`)).toBeInTheDocument();
      });
    });

    // Headings must clear the sticky tab row when jumped to
    it('gives each section scroll margin for the sticky tabs', () => {
      const { container } = renderPage();

      expect(container.querySelector('section#about')).toHaveClass('scroll-mt-28');
    });

    // `community` is the only filter the experiences list honours
    it('asks for the community’s own experiences', () => {
      renderPage();

      expect(useExperiences).toHaveBeenCalledWith(
        expect.objectContaining({ community: 'c1' }),
        true,
      );
    });

    it('asks for the community’s own moments', () => {
      renderPage();

      expect(useMoments).toHaveBeenCalledWith(expect.objectContaining({ community: 'c1' }));
    });
  });

  describe('join panel', () => {
    it('shows the member count', () => {
      renderPage();
      expect(screen.getByText('12 members')).toBeInTheDocument();
    });

    it('invites a non-member to join', () => {
      renderPage();
      expect(screen.getByRole('button', { name: 'Join Community' })).toBeEnabled();
    });

    it('asks to request when the community is private', () => {
      renderPage({ isPublic: false });
      expect(screen.getByRole('button', { name: 'Request to Join' })).toBeInTheDocument();
    });

    it('shows an existing member as joined', () => {
      renderPage({}, 'u2');

      const joined = screen.getByRole('button', { name: 'Joined' });
      expect(joined).toBeDisabled();
    });

    // The owner also appears in the Members list, so scope to the panel's card
    it('names the owner as organiser', () => {
      renderPage();

      const organiserCard = screen.getByText('Organiser').closest('.rounded-2xl');
      expect(organiserCard).toHaveTextContent('Lily');
    });
  });

  // Neither has a backend; the sections exist so the page is complete but must
  // not invent content
  describe('sections with no backend', () => {
    it('says places are unavailable rather than showing any', () => {
      renderPage();
      expect(screen.getByText("Places for a community aren't available yet")).toBeInTheDocument();
    });

    it('says there are no reviews rather than showing a rating', () => {
      renderPage();
      expect(screen.getByText('No reviews for Nairobi Hikers yet')).toBeInTheDocument();
    });
  });
});
