import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConnectPlaceDrawerProvider } from '@/context/ConnectPlaceDrawerContext';

import { ClaimCard } from './ClaimCard';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }),
}));

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

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useClaimPlaceOwnership: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
  useDeletePlaceOwnership: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
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

describe('ClaimCard', () => {
  it('opens the Connect a place drawer when Start claim is clicked', async () => {
    const user = userEvent.setup();

    render(
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
});
