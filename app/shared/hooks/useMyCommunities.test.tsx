import { renderHook } from '@testing-library/react';

import { useMyCommunities } from './useCommunities';

const useQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: unknown[] }) => useQuery(options),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const getCommunities = jest.fn();
jest.mock('@/services/community', () => ({
  getCommunities: (...args: unknown[]) => getCommunities(...args),
}));

// DEV-436: the person's own accepted memberships, not the reader's follows
describe('useMyCommunities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockImplementation((options: { queryKey: unknown[] }) => {
      const isJoined = options.queryKey.includes(true) && options.queryKey.includes('u9');
      return {
        data: {
          data: {
            results: isJoined ? [{ id: 'own' }, { id: 'joined' }] : [{ id: 'own' }],
          },
        },
        isLoading: false,
      };
    });
  });

  it('asks for that person’s joined communities', async () => {
    renderHook(() => useMyCommunities('u9'));

    const joinedCall = useQuery.mock.calls
      .map(([options]) => options)
      .find((options) => options.queryKey.includes('u9') && options.queryKey.includes(true));
    expect(joinedCall).toBeDefined();
    await joinedCall.queryFn();
    expect(getCommunities).toHaveBeenCalledWith(
      undefined,
      1,
      12,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { joined: true, member: 'u9', city: undefined },
    );
  });

  it('leaves the ones they own out of joined', () => {
    const { result } = renderHook(() => useMyCommunities('u9'));

    expect(result.current.owned.map((c) => c.id)).toEqual(['own']);
    expect(result.current.joined.map((c) => c.id)).toEqual(['joined']);
  });
});
