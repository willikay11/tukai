import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceHostSection } from './ExperienceHostSection';

let sessionState: { data: { user: { id: string } } | null } = { data: { user: { id: 'viewer' } } };
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

jest.mock('@/app/shared/components/SendMessage/SendMessage', () => ({
  SendMessage: () => <div data-testid="send-message" />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const useCommunityDetail = jest.fn();
const joinCommunity = jest.fn();
const needAuth = jest.fn();

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityDetail: (id: string, enabled: boolean) => useCommunityDetail(id, enabled),
  useJoinCommunity: () => ({ mutate: joinCommunity, isPending: false }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
}));

const member = (id: string, inviteStatus: string) =>
  ({ id, inviteStatus, user: { id } }) as never;

const experience = (overrides: Partial<Experience>) =>
  ({
    id: 'exp-1',
    ...overrides,
  }) as unknown as Experience;

describe('ExperienceHostSection', () => {
  beforeEach(() => {
    sessionState = { data: { user: { id: 'viewer' } } };
    jest.clearAllMocks();
    useCommunityDetail.mockReturnValue({ data: undefined });
  });

  it('names the host and how much they have run', () => {
    render(
      <ExperienceHostSection
        experience={experience({
          host: { id: 'host-1', displayName: 'Tony Ouma', experienceHostedCount: 4 } as never,
        })}
      />,
    );

    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
    expect(screen.getByText('4 Experiences organised')).toBeInTheDocument();
  });

  it('offers to message a host who is somebody else', () => {
    render(
      <ExperienceHostSection
        experience={experience({ host: { id: 'host-1', displayName: 'Tony Ouma' } as never })}
      />,
    );

    expect(screen.getByRole('button', { name: /Message host/ })).toBeInTheDocument();
  });

  it('does not offer to message yourself on your own experience', () => {
    render(
      <ExperienceHostSection
        experience={experience({ host: { id: 'viewer', displayName: 'Tony Ouma' } as never })}
      />,
    );

    expect(screen.queryByRole('button', { name: /Message host/ })).not.toBeInTheDocument();
  });

  it('shows the host community as a row to its own page', () => {
    render(
      <ExperienceHostSection
        experience={experience({ hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } })}
      />,
    );

    expect(screen.getByText('Nairobi Makers Circle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Host community' })).toBeInTheDocument();
  });

  it('shows the host community member count once its detail has loaded', () => {
    useCommunityDetail.mockReturnValue({
      data: { data: { id: 'c1', title: 'Nairobi Makers Circle', membersCount: 66, members: [] } },
    });

    render(
      <ExperienceHostSection
        experience={experience({ hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } })}
      />,
    );

    expect(screen.getByText('66 members')).toBeInTheDocument();
  });

  it('offers Join on the host community to a reader who is not in it', () => {
    useCommunityDetail.mockReturnValue({
      data: { data: { id: 'c1', title: 'Nairobi Makers Circle', isPublic: true, members: [] } },
    });

    render(
      <ExperienceHostSection
        experience={experience({ hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Join/ }));

    expect(joinCommunity).toHaveBeenCalledWith('c1', expect.any(Object));
  });

  it('hides Join once the reader is already a member', () => {
    useCommunityDetail.mockReturnValue({
      data: {
        data: {
          id: 'c1',
          title: 'Nairobi Makers Circle',
          isPublic: true,
          members: [member('viewer', 'accepted')],
        },
      },
    });

    render(
      <ExperienceHostSection
        experience={experience({ hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } })}
      />,
    );

    expect(screen.queryByRole('button', { name: /Join/ })).not.toBeInTheDocument();
  });

  it('sends a signed-out reader through sign-in before joining the host community', () => {
    sessionState = { data: null };
    useCommunityDetail.mockReturnValue({
      data: { data: { id: 'c1', title: 'Nairobi Makers Circle', isPublic: true, members: [] } },
    });

    render(
      <ExperienceHostSection
        experience={experience({ hostCommunity: { id: 'c1', title: 'Nairobi Makers Circle' } })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Join/ }));

    expect(needAuth).toHaveBeenCalledWith('join', expect.any(Function));
    expect(joinCommunity).not.toHaveBeenCalled();
  });

  it('renders nothing for an experience with neither a host nor a host community', () => {
    const { container } = render(<ExperienceHostSection experience={experience({})} />);

    expect(container).toBeEmptyDOMElement();
  });
});
