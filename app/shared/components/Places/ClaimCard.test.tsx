import { useEffect } from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConnectPlaceDrawerProvider, useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { renderWithStore } from '@/test-utils/renderWithStore';

import { ClaimCard } from './ClaimCard';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }),
}));

let communityDetail: { id: string; title: string } | undefined;
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: () => ({
    data: { data: { results: [{ id: 'c1', title: 'Weekend Readers', photos: [] }] } },
    isLoading: false,
  }),
  useCreateCommunity: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useSubmitCommunityVerification: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useUploadVerificationDocument: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useDeleteVerificationDocument: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useVerificationDocuments: () => ({ data: undefined }),
  useCommunityDetail: () => ({ data: communityDetail && { data: communityDetail } }),
}));

const PLACE = {
  id: 'place-1',
  title: 'Karura Forest',
  slug: 'karura-forest',
  location: { city: 'Gigiri' },
  photos: [],
  totalReviews: 0,
  averageRating: 0,
};

// The real ownership check: what ClaimCard reads to decide whether a claim
// is open at all, independent of anything this browser remembers locally
let ownership: { community: string; approved: boolean } | null = null;
let isLoadingOwnership = false;

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useClaimPlaceOwnership: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useDeletePlaceOwnership: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  usePlaceOwnership: () => ({ data: { data: ownership }, isLoading: isLoadingOwnership }),
  usePlaceOwnerships: (placeIds: string[]) => placeIds.map(() => ({ data: undefined })),
  usePlaceReservationProfiles: () => ({ data: undefined }),
  useCreatePlace: () => ({ mutateAsync: jest.fn() }),
  usePlace: (_id: string | null, enabled = true) => ({ data: enabled ? { data: PLACE } : undefined }),
  usePlaces: () => ({ data: { data: { results: [] } }, isFetching: false }),
}));

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: () => ({ data: [] }),
}));

jest.mock('@/app/shared/hooks/useToast', () => ({
  toast: jest.fn(),
  useToast: () => ({ toast: jest.fn() }),
}));

/** Writes a claim into this browser's own remembered store, through the real context. */
const SubmitClaimOnMount = ({ placeId }: { placeId: string }) => {
  const { submitClaim } = useConnectPlaceDrawer()!;
  useEffect(() => {
    submitClaim({
      communityId: 'c1',
      communityName: 'Weekend Readers',
      places: [{ id: placeId, title: 'Karura Forest', isOnTukai: true }],
      documents: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

describe('ClaimCard', () => {
  beforeEach(() => {
    ownership = null;
    isLoadingOwnership = false;
    communityDetail = undefined;
  });

  it('offers to start a claim when neither this browser nor the API knows of one', () => {
    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.getByRole('button', { name: /Start claim/i })).toBeInTheDocument();
    expect(screen.queryByText(/under review/)).not.toBeInTheDocument();
  });

  it('opens the Connect a place drawer when Start claim is clicked', async () => {
    const user = userEvent.setup();

    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.queryByRole('heading', { name: 'Connect a business or place' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Start claim/i }));

    expect(
      await screen.findByRole('heading', { name: 'Connect a business or place' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Karura Forest')).toBeInTheDocument();
  });

  it('shows the pending strip for a claim this browser remembers, confirmed by the API', () => {
    ownership = { community: 'c1', approved: false };

    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <SubmitClaimOnMount placeId="place-1" />
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.getByText('Your claim is under review')).toBeInTheDocument();
    expect(screen.getByText(/Sent for Weekend Readers/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View claim' })).toBeInTheDocument();
  });

  it('shows the pending strip from the API alone, with no claim to open, when this browser has none', () => {
    ownership = { community: 'c1', approved: false };
    communityDetail = { id: 'c1', title: 'Weekend Readers' };

    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.getByText('Your claim is under review')).toBeInTheDocument();
    expect(screen.getByText(/Sent for Weekend Readers/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View claim' })).not.toBeInTheDocument();
  });

  it('does not show the pending strip once the API no longer has a claim, even if this browser still remembers one', () => {
    ownership = null;

    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <SubmitClaimOnMount placeId="place-1" />
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.queryByText(/under review/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start claim/i })).toBeInTheDocument();
  });

  it('does not show the pending strip once the API says the claim is approved', () => {
    ownership = { community: 'c1', approved: true };

    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <SubmitClaimOnMount placeId="place-1" />
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.queryByText(/under review/)).not.toBeInTheDocument();
  });

  it('trusts this browser while the API check is in flight, to avoid a flash of Start claim', () => {
    isLoadingOwnership = true;

    renderWithStore(
      <ConnectPlaceDrawerProvider>
        <SubmitClaimOnMount placeId="place-1" />
        <ClaimCard placeId="place-1" placeName="Karura Forest" />
      </ConnectPlaceDrawerProvider>,
    );

    expect(screen.getByText('Your claim is under review')).toBeInTheDocument();
  });
});
