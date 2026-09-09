'use client';

import { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

/**
 * Hides the app's own chrome on the auth screens.
 *
 * Those screens draw their own minimal bar — the logo and a way out — over a
 * full-bleed image, so the site header, filters and footer would sit on top of
 * it. They are a way into the app rather than a page of it.
 */
export const ChromeGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  // The segment, not the prefix: a route merely starting with those letters —
  // /authors, say — is an ordinary page
  const isAuthRoute = pathname === '/auth' || pathname?.startsWith('/auth/');

  if (isAuthRoute) return null;

  return <>{children}</>;
};
