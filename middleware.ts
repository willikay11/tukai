import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { Session } from 'next-auth';
export async function middleware(request: NextRequest) {
  const token: any = await getToken({ req: request });

  // Check if the user is authenticated
  if (!token || token?.sessionType !== 'sign-in') {
    // Redirect to the sign-in page if the user is not authenticated
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/place/:path*'], // Adjust the paths as needed
};
