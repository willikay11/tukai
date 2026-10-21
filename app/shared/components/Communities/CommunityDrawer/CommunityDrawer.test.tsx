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
jest.mock('./CommunityDrawerFooter', () => ({
  CommunityDrawerFooter: () => <div data-testid="footer" />,
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
    members: [],
    membersCount: 3,
    ...overrides,
  },
});

const renderDrawer = () => render(<CommunityDrawer communityId="c1" isOpen onClose={jest.fn()} />);

describe('CommunityDrawer', () => {
  beforeEach(() => {
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

  it('shows the title, visibility, and a verified badge', () => {
    communityResponse = community({ verified: true });
    renderDrawer();

    expect(screen.getByText('Nairobi Trail Runners')).toBeInTheDocument();
    expect(screen.getByText('Public community')).toBeInTheDocument();
    expect(screen.getByTestId('icon-CheckmarkBadge01Icon')).toBeInTheDocument();
  });

  it('says private for a private community', () => {
    communityResponse = community({ isPublic: false });
    renderDrawer();

    expect(screen.getByText('Private community')).toBeInTheDocument();
  });

  it('shows the four tabs - About, Experiences, Members, Moments', () => {
    renderDrawer();

    expect(screen.getByRole('tab', { name: /About/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Experiences/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Members/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Moments/ })).toBeInTheDocument();
  });

  it('shows the description and the members/experiences facts', () => {
    experiencesResponse = { data: { results: [{ id: 'e1' }, { id: 'e2' }] } };
    renderDrawer();

    expect(screen.getByText('Weekend trail runs around the city.')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2 upcoming')).toBeInTheDocument();
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
});
