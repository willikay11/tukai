import { apiWithToken } from '@/services/apiService';

import { getCommunities } from './community';

jest.mock('@/services/apiService', () => ({
  api: { get: jest.fn() },
  apiWithToken: jest.fn(),
}));

const get = jest.fn();
const sentParams = () => new URLSearchParams((get.mock.calls[0][0] as string).split('?')[1]);

beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue({ status: 200, data: { results: [] } });
  (apiWithToken as jest.Mock).mockResolvedValue({ get });
});

// DEV-434 / DEV-436
describe('getCommunities filters', () => {
  const call = (options: Parameters<typeof getCommunities>[9]) =>
    getCommunities(
      undefined,
      1,
      12,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      options,
    );

  it('asks for one person’s accepted memberships', async () => {
    await call({ joined: true, member: 'u9' });

    expect(sentParams().get('joined')).toBe('true');
    expect(sentParams().get('member')).toBe('u9');
    expect(sentParams().get('following')).toBeNull();
  });

  it('asks for the communities in a city', async () => {
    await call({ city: 'Nairobi' });

    expect(sentParams().get('city')).toBe('Nairobi');
  });

  it('sends none of them unless asked', async () => {
    await call(undefined);

    ['joined', 'member', 'city'].forEach((param) => expect(sentParams().get(param)).toBeNull());
  });
});
