import { AxiosError } from 'axios';

const getSession = jest.fn();
const signOut = jest.fn();

jest.mock('next-auth/react', () => ({
  getSession: () => getSession(),
  signOut: (options: unknown) => signOut(options),
}));

/**
 * The response interceptor, exercised directly.
 *
 * Importing the module registers the interceptors on the axios instance, so
 * the handler is read back off it rather than reimplemented here.
 */
const loadRejectionHandler = async () => {
  jest.resetModules();
  // The instance is not exported; `apiWithToken` hands back the same one
  const { apiWithToken } = await import('./apiService');
  const client = await apiWithToken();
  const handlers = (
    client.interceptors.response as never as {
      handlers: { rejected: (error: unknown) => Promise<unknown> }[];
    }
  ).handlers;

  return handlers[handlers.length - 1].rejected;
};

const unauthorised = () =>
  ({
    config: { headers: {} },
    response: { status: 401 },
  }) as unknown as AxiosError;

describe('the authenticated client on a 401', () => {
  beforeEach(() => jest.clearAllMocks());

  // A reader who was never signed in has nothing to sign out of. Redirecting
  // them is what bounced anonymous visitors off pages that make one
  // authenticated call among many public ones.
  it('does not sign out a visitor who has no session', async () => {
    getSession.mockResolvedValue(null);
    const onRejected = await loadRejectionHandler();

    await expect(onRejected(unauthorised())).rejects.toBeDefined();

    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out a session whose token cannot be refreshed', async () => {
    getSession.mockResolvedValue({ user: {}, error: 'RefreshAccessTokenError' });
    const onRejected = await loadRejectionHandler();

    await expect(onRejected(unauthorised())).rejects.toBeDefined();

    expect(signOut).toHaveBeenCalledWith({ redirect: true, callbackUrl: '/auth/sign-in' });
  });

  it('signs out a session that came back without a token', async () => {
    getSession.mockResolvedValue({ user: {} });
    const onRejected = await loadRejectionHandler();

    await expect(onRejected(unauthorised())).rejects.toBeDefined();

    expect(signOut).toHaveBeenCalled();
  });
});
