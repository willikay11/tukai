import React, { Suspense } from 'react';

import type { Metadata, Viewport } from 'next';

import { hugeiconsLicense } from '@hugeicons/react-pro';

import { PillsSkeleton } from '@/app/shared/components/Cards';
import { DownloadApp } from '@/app/shared/components/Download';
import { ChromeGate } from '@/app/shared/components/Global';
import { Footer } from '@/app/shared/components/Global';
import { appFont } from '@/app/shared/components/Global';
import { GlobalLoading } from '@/app/shared/components/Global';
import { LocationPrompt } from '@/app/shared/components/LocationPicker';
import { BottomNavigation, TopBar } from '@/app/shared/components/Navigation';
import { AskTukaiButton } from '@/app/shared/components/TukAI';
import { PageFilters } from '@/components/ui/pageFilters';
import { Toaster } from '@/components/ui/toaster';
import { AuthDialogProvider } from '@/context/AuthDialogContext';
import { BucketListDrawerProvider } from '@/context/BucketListDrawerContext';
import { CommunityDrawerProvider } from '@/context/CommunityDrawerContext';
import { ConnectPlaceDrawerProvider } from '@/context/ConnectPlaceDrawerContext';
import { CreateCommunityDrawerProvider } from '@/context/CreateCommunityDrawerContext';
import { CreateExperienceDrawerProvider } from '@/context/CreateExperienceDrawerContext';
import { DownloadAppProvider } from '@/context/DownloadAppContext';
import { ExperienceDrawerProvider } from '@/context/ExperienceDrawerContext';
import { HostingPlanProvider } from '@/context/HostingPlanContext';
import { InboxDrawerProvider } from '@/context/InboxDrawerContext';
import { LocationProvider } from '@/context/LocationContext';
import { PlaceDrawerProvider } from '@/context/PlaceDrawerContext';
import { PlanProvider } from '@/context/PlanContext';
import { SelectedCategoryProvider } from '@/context/SelectedCategoryContext';
import { TukaiProvider } from '@/context/TukaiContext';
import ReactQueryClientProvider from '@/providers/ReactQueryProvider';
import SessionProvider from '@/providers/SessionProvider';
import { metadataBase } from '@/utils/share-metadata';

import './globals.css';
import { ReduxProvider } from './redux-provider';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export const metadata: Metadata = {
  // Next resolves every relative metadata URL against this. Without it a
  // relative og:image is emitted as-is, and no crawler can resolve it.
  metadataBase,
  title: 'Tukai',
  description:
    "Tukai is your go-to app for discovering exciting events and experiences happening around you. Whether you're looking for live concerts, festivals, social gatherings, or cultural events, Tukai makes it easy to stay connected and find the best activities in your area. Explore and enjoy real-time updates on local experiences tailored to your interests, and never miss out on the fun again.",
};

/**
 * `viewport-fit=cover` lets the page run under an iPhone's notch and home
 * indicator. Without it every `env(safe-area-inset-*)` the shell pads with -
 * the bottom bar, the sheets, the floating button - resolves to 0.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Where the photos live.
 *
 * Both hosts are declared in `next.config.mjs` as remote patterns; the naming
 * is not a clean prefix swap (`staging-api` pairs with `cdn-staging`), so the
 * two are mapped explicitly rather than derived with a regex that would
 * quietly resolve to a host that does not exist. A local API has no CDN, and
 * warms nothing.
 */
const MEDIA_ORIGIN_BY_API: Record<string, string> = {
  'https://api.tukai.co': 'https://cdn.tukai.co',
  'https://staging-api.tukai.co': 'https://cdn-staging.tukai.co',
};

const MEDIA_ORIGIN =
  MEDIA_ORIGIN_BY_API[(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          Every photo in the app comes from the media CDN, and none of it is
          referenced by the HTML - the lists are fetched client-side, so the
          browser only learns the origin exists once React has rendered a card.
          Warming the connection here means the first image request does not
          also pay for DNS and a TLS handshake.
        */}
        {MEDIA_ORIGIN && (
          <>
            <link rel="preconnect" href={MEDIA_ORIGIN} crossOrigin="" />
            <link rel="dns-prefetch" href={MEDIA_ORIGIN} />
          </>
        )}
      </head>
      <body className={`${appFont.className} flex min-h-dvh flex-col`}>
        <ReduxProvider>
          <SessionProvider>
            <ReactQueryClientProvider>
              <GlobalLoading />
              <Toaster />
              <DownloadAppProvider>
                <LocationProvider>
                  <AuthDialogProvider>
                    <SelectedCategoryProvider>
                      <PlanProvider>
                        <CreateCommunityDrawerProvider>
                          <HostingPlanProvider>
                            {/* Outside PlaceDrawerProvider: PlaceDrawer (below) renders as a
                                sibling to {children} inside that provider, not a descendant of
                                it, so it needs this one wrapping further out to reach it at all -
                                a provider nested inside PlaceDrawerProvider is invisible to
                                PlaceDrawer itself, only to the page content underneath it. */}
                            <ConnectPlaceDrawerProvider>
                              <PlaceDrawerProvider>
                                <ExperienceDrawerProvider>
                                  <BucketListDrawerProvider>
                                    <CommunityDrawerProvider>
                                      <CreateExperienceDrawerProvider>
                                        <InboxDrawerProvider>
                                          <TukaiProvider>
                                            <div className="relative flex min-h-dvh flex-col">
                                              {/* The auth screens draw their own bar, so the app's
                            chrome stands down there rather than stacking on it */}
                                              <ChromeGate>
                                                <TopBar />

                                                <Suspense fallback={<PillsSkeleton />}>
                                                  <PageFilters />
                                                </Suspense>
                                                <LocationPrompt />
                                              </ChromeGate>

                                              <div className="flex-grow">{children}</div>

                                              <ChromeGate>
                                                <Footer />
                                              </ChromeGate>
                                            </div>
                                            <ChromeGate>
                                              {/* <DownloadApp /> */}
                                              {/* It reads the `tab` parameter to stand aside for the
                            create button on My Communities, and `useSearchParams`
                            in a component this layout renders on every page opts
                            the whole app out of static rendering without this -
                            the same boundary PageFilters sits behind above. */}
                                              <Suspense fallback={null}>
                                                <BottomNavigation />
                                              </Suspense>
                                              <AskTukaiButton />
                                            </ChromeGate>
                                          </TukaiProvider>
                                        </InboxDrawerProvider>
                                      </CreateExperienceDrawerProvider>
                                    </CommunityDrawerProvider>
                                  </BucketListDrawerProvider>
                                </ExperienceDrawerProvider>
                              </PlaceDrawerProvider>
                            </ConnectPlaceDrawerProvider>
                          </HostingPlanProvider>
                        </CreateCommunityDrawerProvider>
                      </PlanProvider>
                    </SelectedCategoryProvider>
                  </AuthDialogProvider>
                </LocationProvider>
              </DownloadAppProvider>
            </ReactQueryClientProvider>
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
