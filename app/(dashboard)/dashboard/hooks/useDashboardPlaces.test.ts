import { renderHook } from '@testing-library/react';

import { useMyPlaces, usePlaceBookings } from '@/app/shared/hooks/usePlaces';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { Claim } from '@/types/claim';

import { useDashboardPlaces } from './useDashboardPlaces';

let mockProfiles: unknown[] = [];
let mockBoosts: Record<string, unknown[]> = {};
// Each place's reservation profile, or its boosts (DEV-392), by query
jest.mock('@tanstack/react-query', () => ({
  useQueries: ({ queries }: { queries: { queryKey: string[] }[] }) =>
    queries[0]?.queryKey[0] === 'placeBoosts'
      ? queries.map((query) => ({ data: mockBoosts[query.queryKey[1]] }))
      : mockProfiles,
}));
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useMyPlaces: jest.fn(),
  usePlaceBookings: jest.fn(() => ({ data: [] })),
}));
jest.mock('@/context/ConnectPlaceDrawerContext', () => ({ useConnectPlaceDrawer: jest.fn() }));
jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: () => null }));
jest.mock('@/services/place', () => ({}));

const mockUseMyPlaces = useMyPlaces as jest.Mock;
const mockUseConnectPlaceDrawer = useConnectPlaceDrawer as jest.Mock;

describe('useDashboardPlaces claims', () => {
  const claim = (id: string, status: Claim['status']): Claim => ({
    id,
    communityId: 'community-1',
    communityName: 'Grain Collective',
    places: [{ id: `place-${id}`, title: 'The Good Grain', isOnTukai: true }],
    documents: [],
    status,
    sentAt: new Date().toISOString(),
  });

  beforeEach(() => {
    mockUseMyPlaces.mockReturnValue({ data: undefined, isLoading: false });
  });

  // DEV-391: claims come from the server, merged in by the Connect a place
  // context; Your claims lists the ones still open or turned down
  it('lists the claims under review and not approved', () => {
    mockUseConnectPlaceDrawer.mockReturnValue({
      claims: [
        claim('a', 'review'),
        claim('b', 'rejected'),
        claim('c', 'approved'),
        claim('d', 'cancelled'),
      ],
    });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims.map((one) => one.id)).toEqual(['a', 'b']);
  });

  it('has none without the Connect a place context', () => {
    mockUseConnectPlaceDrawer.mockReturnValue(null);

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.claims).toEqual([]);
  });
});

// DEV-388: the requests waiting at every place, read in one request
describe('useDashboardPlaces reservation requests', () => {
  const placeA = { id: 'place-a', title: 'Kraftory', photos: [] };
  const placeB = { id: 'place-b', title: 'About Thyme', photos: [] };
  const booking = (placeId: string) => ({
    id: `b-${Math.random()}`,
    status: 'requested',
    experience: { id: 'x', place: { id: placeId, title: '' } },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockProfiles = [{ data: { data: { id: 'prof-a' } } }, { data: { data: { id: 'prof-b' } } }];
    mockUseMyPlaces.mockReturnValue({
      data: { data: { results: [placeA, placeB] } },
      isLoading: false,
    });
    mockUseConnectPlaceDrawer.mockReturnValue({ claims: [] });
  });

  afterAll(() => {
    mockProfiles = [];
  });

  it('asks once for every request waiting, across all places', () => {
    renderHook(() => useDashboardPlaces('user-1'));

    expect(usePlaceBookings).toHaveBeenCalledWith('host', {
      bookingStatus: 'requested',
      enabled: true,
    });
  });

  it('counts the requests waiting at each place', () => {
    (usePlaceBookings as jest.Mock).mockReturnValue({
      data: [booking('place-a'), booking('place-a'), booking('place-b'), booking('elsewhere')],
    });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.places.map((place) => place.stats[0].value)).toEqual(['2', '1']);
    expect(result.current.pendingRequestCount).toBe(3);
  });

  it('offers to set up reservations at a place without them', () => {
    mockProfiles = [{ data: { data: { id: 'prof-a' } } }, { data: { data: null } }];
    (usePlaceBookings as jest.Mock).mockReturnValue({ data: [] });

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.places[0].stats[0]).toMatchObject({
      label: 'Reservation requests',
      value: '0',
      alert: false,
    });
    expect(result.current.places[1].stats[0].label).toBe('Set up reservations');
  });
});

// DEV-392: each place says whether it's boosted, and opens Boost
describe('useDashboardPlaces boosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfiles = [];
    mockBoosts = {};
    mockUseMyPlaces.mockReturnValue({
      data: { data: { results: [{ id: 'place-a', title: 'Kraftory', photos: [] }] } },
      isLoading: false,
    });
    mockUseConnectPlaceDrawer.mockReturnValue({ claims: [] });
  });

  afterAll(() => {
    mockBoosts = {};
  });

  it('offers to boost a place that is not boosted', () => {
    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.places[0].stats[1]).toMatchObject({
      label: 'Boost this place',
      value: '',
      alert: false,
    });
  });

  it('says until when a boosted place is boosted', () => {
    mockBoosts = {
      'place-a': [
        {
          id: 'b1',
          status: 'paid',
          isLive: true,
          startsAt: '2026-01-01T00:00:00Z',
          endsAt: '2099-11-28T12:00:00',
        },
      ],
    };

    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.places[0].stats[1]).toMatchObject({
      label: 'Boosted until',
      value: 'Sat 28 Nov',
    });
  });

  it('keeps the reservation stat first, for the request count', () => {
    const { result } = renderHook(() => useDashboardPlaces('user-1'));

    expect(result.current.places[0].stats.map((stat) => stat.label)).toEqual([
      'Set up reservations',
      'Boost this place',
    ]);
  });
});
