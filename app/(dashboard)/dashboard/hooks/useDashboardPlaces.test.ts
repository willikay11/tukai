import { renderHook } from '@testing-library/react';

import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useMyPlaces, usePlaceOwnerships } from '@/app/shared/hooks/usePlaces';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { Claim } from '@/types/claim';

import { useDashboardPlaces } from './useDashboardPlaces';

jest.mock('@tanstack/react-query', () => ({ useQueries: () => [] }));
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useMyPlaces: jest.fn(),
  usePlaceOwnerships: jest.fn(),
}));
jest.mock('@/app/shared/hooks/useCommunities', () => ({ useGetCommunities: jest.fn() }));
jest.mock('@/context/ConnectPlaceDrawerContext', () => ({ useConnectPlaceDrawer: jest.fn() }));
jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: () => null }));
jest.mock('@/services/place', () => ({}));

const mockUseMyPlaces = useMyPlaces as jest.Mock;
const mockUsePlaceOwnerships = usePlaceOwnerships as jest.Mock;
const mockUseGetCommunities = useGetCommunities as jest.Mock;
const mockUseConnectPlaceDrawer = useConnectPlaceDrawer as jest.Mock;

const sentClaim: Claim = {
  id: 'claim-1',
  communityId: 'community-1',
  communityName: 'Grain Collective',
  places: [{ id: 'place-1', title: 'The Good Grain', isOnTukai: true }],
  documents: [],
  // What every claim is stored with when it is sent
  status: 'review',
  sentAt: new Date().toISOString(),
};

const withOwnership = (data: { approved: boolean } | null | undefined) =>
  mockUsePlaceOwnerships.mockReturnValue([{ data: data === undefined ? undefined : { data } }]);

describe('useDashboardPlaces claims', () => {
  beforeEach(() => {
    mockUseMyPlaces.mockReturnValue({ data: undefined, isLoading: false });
    mockUseGetCommunities.mockReturnValue({ data: undefined });
    mockUseConnectPlaceDrawer.mockReturnValue({ claims: [sentClaim] });
  });

  // The Good Grain: approved on the backend, still "Under review" here. Once
  // approved its place belongs in My places, not Your claims.
  it('drops a claim the API has approved, rather than keeping the status it was sent with', () => {
    withOwnership({ approved: true });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims).toEqual([]);
  });

  it('drops a claim whose place is already in My places', () => {
    withOwnership(undefined);
    mockUseMyPlaces.mockReturnValue({
      data: { data: { results: [{ id: 'place-1', title: 'The Good Grain', photos: [] }] } },
      isLoading: false,
    });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims).toEqual([]);
    expect(result.current.places.map((place) => place.name)).toEqual(['The Good Grain']);
  });

  it('keeps a claim until every place on it is in My places', () => {
    mockUseConnectPlaceDrawer.mockReturnValue({
      claims: [
        {
          ...sentClaim,
          places: [...sentClaim.places, { id: 'place-2', title: 'Second', isOnTukai: true }],
        },
      ],
    });
    mockUsePlaceOwnerships.mockReturnValue([
      { data: { data: { approved: true } } },
      { data: { data: { approved: false } } },
    ]);
    mockUseMyPlaces.mockReturnValue({
      data: { data: { results: [{ id: 'place-1', title: 'The Good Grain', photos: [] }] } },
      isLoading: false,
    });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims.map((claim) => claim.status)).toEqual(['review']);
  });

  it('keeps a claim under review while its ownership is unapproved', () => {
    withOwnership({ approved: false });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims.map((claim) => claim.status)).toEqual(['review']);
  });

  it('keeps a claim under review until its ownership has been read', () => {
    withOwnership(undefined);

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims.map((claim) => claim.status)).toEqual(['review']);
  });

  it('reads a claim as not approved once its community verification is rejected', () => {
    withOwnership({ approved: false });
    mockUseGetCommunities.mockReturnValue({
      data: { data: { results: [{ id: 'community-1', verificationStatus: 'rejected' }] } },
    });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims.map((claim) => claim.status)).toEqual(['rejected']);
  });

  it('drops a claim whose ownership no longer exists', () => {
    withOwnership(null);

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims).toEqual([]);
  });

  it('asks about each claimed place once, fresh from the API', () => {
    mockUseConnectPlaceDrawer.mockReturnValue({
      claims: [sentClaim, { ...sentClaim, id: 'claim-2' }],
    });
    withOwnership({ approved: true });

    renderHook(() => useDashboardPlaces('user-1'));

    expect(mockUsePlaceOwnerships).toHaveBeenCalledWith(['place-1'], true, 0);
  });
});
