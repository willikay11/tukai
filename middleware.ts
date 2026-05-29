import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token: any = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const isExperienceCreateRoute =
    pathname === '/experiences/create' || pathname.startsWith('/experiences/create/');
  const isCommunityCreateRoute =
    pathname === '/communities/create' || pathname.startsWith('/communities/create/');
  const isExperienceTypeRoute =
    pathname === '/experiences/type' || pathname.startsWith('/experiences/type');
  const isExcludedExperienceRoute =
    pathname.startsWith('/experiences') && !isExperienceCreateRoute && !isExperienceTypeRoute;
  const isExcludedCommunityRoute = pathname.startsWith('/communities') && !isCommunityCreateRoute;

  // Exclude auth routes from middleware
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    isExcludedExperienceRoute ||
    isExcludedCommunityRoute ||
    pathname.startsWith('/place') ||
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
    '/((?!_next/static|_next/image|favicon.ico|images|css|js|^$).*)', // Exclude static assets and the root path
  ],
};
