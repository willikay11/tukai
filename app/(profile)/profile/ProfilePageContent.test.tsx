import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProfilePageContent } from './ProfilePageContent';
import { MyProfile } from './profile';

let session: { user: { id: string; name?: string; image?: string; displayName?: string } } | null =
  {
    user: { id: 'u1', name: 'Wanjiku Maina' },
  };
let status = 'authenticated';
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: session, status }) }));

let profileResponse: { success: boolean; data?: MyProfile } = { success: true };
let isLoading = false;
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useMyProfile: () => ({ data: profileResponse, isLoading }),
}));

jest.mock('./components/EditProfileDrawer', () => ({
  EditProfileDrawer: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>editing</div> : null),
}));

const profile = (overrides: Partial<MyProfile> = {}): MyProfile =>
  ({
    id: 'u1',
    firstName: 'Wanjiku',
    lastName: 'Maina',
    displayName: 'wanjiku.m',
    bio: 'Weekend hiker, slow reader.',
    followersCount: '128',
    followingCount: '64',
    dateCreated: '2026-03-04T09:00:00Z',
    interests: [{ id: 'i1', name: 'Hiking' }],
    ...overrides,
  }) as MyProfile;

describe('the profile page', () => {
  beforeEach(() => {
    session = { user: { id: 'u1', name: 'Wanjiku Maina' } };
    status = 'authenticated';
    profileResponse = { success: true, data: profile() };
    isLoading = false;
  });

  it('names the reader, with their handle and what they wrote', () => {
    render(<ProfilePageContent />);

    expect(screen.getByRole('heading', { name: 'Wanjiku Maina' })).toBeInTheDocument();
    expect(screen.getByText('@wanjiku.m')).toBeInTheDocument();
    expect(screen.getByText('Weekend hiker, slow reader.')).toBeInTheDocument();
  });

  // Both counts arrive as strings
  it('shows the counts', () => {
    render(<ProfilePageContent />);

    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
  });

  it('says how long they have been here', () => {
    render(<ProfilePageContent />);

    expect(screen.getByText('On Tukai since March 2026')).toBeInTheDocument();
  });

  it('lists what they are into', () => {
    render(<ProfilePageContent />);

    expect(screen.getByText('Hiking')).toBeInTheDocument();
  });

  it('shows only the links that were set', () => {
    profileResponse = {
      success: true,
      data: profile({ instagramUrl: 'https://instagram.com/wanjiku' }),
    };
    render(<ProfilePageContent />);

    expect(screen.getByRole('link', { name: /Instagram/ })).toHaveAttribute(
      'href',
      'https://instagram.com/wanjiku',
    );
    expect(screen.queryByRole('link', { name: /TikTok/ })).not.toBeInTheDocument();
  });

  it('leaves the socials out entirely where none are set', () => {
    render(<ProfilePageContent />);

    expect(screen.queryByText('Where else to find you')).not.toBeInTheDocument();
  });

  it('opens the editor', async () => {
    render(<ProfilePageContent />);

    await userEvent.click(screen.getByRole('button', { name: /Edit profile/ }));

    expect(screen.getByText('editing')).toBeInTheDocument();
  });

  it('points at the other things that are theirs', () => {
    render(<ProfilePageContent />);

    expect(screen.getByRole('link', { name: /My plans/ })).toHaveAttribute('href', '/plans');
    expect(screen.getByRole('link', { name: /Bucket lists/ })).toHaveAttribute(
      'href',
      '/bucket-lists',
    );
  });

  /**
   * The session carries a name and picture even where the profile request
   * failed, so the page is still worth showing — and says what happened.
   */
  it('falls back to the session when the profile cannot be loaded', () => {
    profileResponse = { success: false };
    render(<ProfilePageContent />);

    expect(screen.getByRole('heading', { name: 'Wanjiku Maina' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Some of your profile could not be loaded. What is shown comes from this session.',
      ),
    ).toBeInTheDocument();
  });

  it('asks a signed-out reader to sign in', () => {
    session = null;
    status = 'unauthenticated';
    render(<ProfilePageContent />);

    expect(screen.getByText('Sign in to see your profile.')).toBeInTheDocument();
  });

  it('shows a placeholder while it loads', () => {
    isLoading = true;
    render(<ProfilePageContent />);

    expect(screen.queryByRole('heading', { name: 'Wanjiku Maina' })).not.toBeInTheDocument();
  });
});
