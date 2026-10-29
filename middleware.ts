import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token: any = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const isCommunityCreateRoute =
    pathname === '/communities/create' || pathname.startsWith('/communities/create/');
  // Creating an experience is a drawer now, not a route, so nothing under
  // /experiences needs carving out for it any more.
  const isExcludedExperienceRoute = pathname.startsWith('/experiences');
  const isExcludedCommunityRoute = pathname.startsWith('/communities') && !isCommunityCreateRoute;

  // Exclude auth routes from middleware
  if (
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    isExcludedExperienceRoute ||
    isExcludedCommunityRoute ||
    // Moments are public: the feed, a moment and its comments all read without
    // a token. Posting, liking and flagging still need one, and each prompts
    // for sign-in where it is pressed rather than at the door.
    pathname.startsWith('/moments') ||
    pathname.startsWith('/place') ||
    // Browsing hosting plans needs no account; signing in is only prompted
    // when a plan button is actually pressed (see PricingPageContent).
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/unsubscribe') ||
    (pathname === '/' && !token)
  ) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (!token.hasInterests) {
    return NextResponse.redirect(new URL('/auth/interests', request.url));
  }

  // if (!token.hasBillingDetails) {
  //   return NextResponse.redirect(new URL('/auth/subscribe', request.url));
  // }

  // if (!token.hasSubscribed) {
  //   return NextResponse.redirect(new URL('/auth/subscribe', request.url));
  // }

  if (!token.emailVerified) {
    return NextResponse.redirect(new URL('/auth/otp-confirmation', request.url));
  }
  return NextResponse.next();
}

// Configure the middleware to run on all routes except auth routes and specific excluded routes
export const config = {
  matcher: [
    // sitemap.xml and robots.txt are framework-served files, the same tier as
    // favicon.ico - a crawler fetching either must never be bounced to
    // /auth/sign-in, which is what the catch-all below did before these were
    // named here explicitly
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|css|js|^$).*)', // Exclude static assets and the root path
  ],
};
