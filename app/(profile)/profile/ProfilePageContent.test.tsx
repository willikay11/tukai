import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProfilePageContent } from './ProfilePageContent';
import { MyProfile } from './profile';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: Wrapper });

let session: { user: { id: string; name?: string; image?: string; displayName?: string } } | null =
  {
    user: { id: 'u1', name: 'Wanjiku Maina' },
  };
let status = 'authenticated';
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: session, status }),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

let profileResponse: { success: boolean; data?: MyProfile } = { success: true };
let isLoading = false;
jest.mock('@/app/shared/hooks/useAuth', () => ({
  useMyProfile: () => ({ data: profileResponse, isLoading }),
}));

jest.mock('./components/EditProfileDrawer', () => ({
  EditProfileDrawer: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>editing</div> : null),
}));

// The hooks behind the two always-on fetches (calendar, reviews) and the
// overview tab's (transactions) - everything else is tab content that is not
// mounted until that tab is selected.
const emptyResponse = { data: { results: [] } };
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: () => ({ data: emptyResponse, isLoading: false }),
  useTicketPurchases: () => ({ data: emptyResponse, isLoading: false }),
}));
jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useEarningsSummary: () => ({ data: { data: null }, isLoading: false }),
  usePayouts: () => ({ data: { data: { results: [] } }, isLoading: false }),
  useGetWallets: () => ({ data: { data: { results: [] } }, isLoading: false }),
  usePayoutQuote: () => ({ data: undefined, isFetching: false }),
  useRequestWithdrawal: () => ({ mutate: jest.fn(), isPending: false }),
  useCreatePhoneWallet: () => ({ mutate: jest.fn(), isPending: false }),
  usePatchPhoneWallet: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateBankWallet: () => ({ mutate: jest.fn(), isPending: false }),
  usePatchBankWallet: () => ({ mutate: jest.fn(), isPending: false }),
  useSetActiveWallet: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/context/ExperienceDrawerContext', () => ({
  useExperienceDrawer: () => null,
}));
jest.mock('@/app/(profile)/hooks/useNotificationPreferences', () => ({
  useNotificationPreferences: () => ({ data: { success: true, data: undefined }, isLoading: false }),
  useUpdateNotificationPreferences: () => ({ mutate: jest.fn(), isPending: false }),
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
  it('shows the counts, with no plans leaving Attended at zero', () => {
    render(<ProfilePageContent />);

    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
    expect(screen.getByText('Attended')).toBeInTheDocument();
  });

  it('says how long they have been here', () => {
    render(<ProfilePageContent />);

    expect(screen.getByText('Since March 2026')).toBeInTheDocument();
  });

  it('shows what they are into, on the Overview tab', () => {
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

  it('opens the editor from settings', async () => {
    render(<ProfilePageContent />);

    await userEvent.click(screen.getByRole('tab', { name: /Settings/ }));
    await userEvent.click(screen.getByRole('button', { name: /Personal details/ }));

    expect(screen.getByText('editing')).toBeInTheDocument();
  });

  it('switches tabs', async () => {
    render(<ProfilePageContent />);

    await userEvent.click(screen.getByRole('tab', { name: /Settings/ }));

    expect(screen.getByText('Your account, payouts and who can see what.')).toBeInTheDocument();
  });

  /**
   * The session carries a name and picture even where the profile request
   * failed, so the page is still worth showing - and says what happened.
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
