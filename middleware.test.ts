import { middleware } from './middleware';

const getToken = jest.fn();
jest.mock('next-auth/jwt', () => ({ getToken: (args: unknown) => getToken(args) }));

jest.mock('next/server', () => ({
  NextResponse: {
    next: () => ({ kind: 'next' }),
    redirect: (url: URL) => ({ kind: 'redirect', to: url.pathname }),
  },
}));

const request = (pathname: string) =>
  ({
    nextUrl: { pathname },
    url: `https://tukai.co${pathname}`,
  }) as never;

const go = async (pathname: string) =>
  (await middleware(request(pathname))) as unknown as {
    kind: string;
    to?: string;
  };

describe('middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('a visitor who is not signed in', () => {
    beforeEach(() => getToken.mockResolvedValue(null));

    // Moments read without an account: the feed, a moment and its comments are
    // all public on the API. Writing still needs one, and the UI asks there.
    it.each(['/moments', '/moments?momentId=abc'])('lets them read %s', async (path) => {
      expect(await go(path.split('?')[0])).toEqual({ kind: 'next' });
    });

    it.each(['/experiences', '/communities', '/places/some-place'])(
      'lets them read %s, as before',
      async (path) => {
        expect(await go(path)).toEqual({ kind: 'next' });
      },
    );

    it('still sends them to sign in for a page that needs an account', async () => {
      expect(await go('/communities/create')).toEqual({
        kind: 'redirect',
        to: '/auth/sign-in',
      });
    });
  });

  describe('a signed-in reader', () => {
    it('reaches moments', async () => {
      getToken.mockResolvedValue({ hasInterests: true, emailVerified: true });

      expect(await go('/moments')).toEqual({ kind: 'next' });
    });

    // The public routes short-circuit before these checks, so an unverified
    // reader is not bounced off a page anyone else can read
    it('is not diverted off moments for an unverified email', async () => {
      getToken.mockResolvedValue({ hasInterests: true, emailVerified: false });

      expect(await go('/moments')).toEqual({ kind: 'next' });
    });
  });
});
