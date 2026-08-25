import React, { Suspense } from 'react';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { hugeiconsLicense } from '@hugeicons/react-pro';

import { PillsSkeleton } from '@/app/shared/components/Cards';
import { DownloadApp } from '@/app/shared/components/Download';
import { AuthActions } from '@/app/shared/components/Global';
import { satoshi } from '@/app/shared/components/Global';
import { GlobalLoading } from '@/app/shared/components/Global';
import { LocationPrompt } from '@/app/shared/components/LocationPicker';
import { UserLocation } from '@/app/shared/components/LocationPicker';
import { AskTukaiButton } from '@/app/shared/components/Navigation';
import { BottomNavigation } from '@/app/shared/components/Navigation';
import { Nav } from '@/app/shared/components/Navigation';
import { Search } from '@/app/shared/components/Search';
import { Footer } from '@/app/shared/components/Share';
import { PageFilters } from '@/components/ui/pageFilters';
import { Toaster } from '@/components/ui/toaster';
import { AuthDialogProvider } from '@/context/AuthDialogContext';
import { DownloadAppProvider } from '@/context/DownloadAppContext';
import { LocationProvider } from '@/context/LocationContext';
import { SelectedCategoryProvider } from '@/context/SelectedCategoryContext';
import ReactQueryClientProvider from '@/providers/ReactQueryProvider';
import SessionProvider from '@/providers/SessionProvider';

import './globals.css';
import { ReduxProvider } from './redux-provider';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export const metadata: Metadata = {
  title: 'Tukai',
  description:
    "Tukai is your go-to app for discovering exciting events and experiences happening around you. Whether you're looking for live concerts, festivals, social gatherings, or cultural events, Tukai makes it easy to stay connected and find the best activities in your area. Explore and enjoy real-time updates on local experiences tailored to your interests, and never miss out on the fun again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${satoshi.className} flex min-h-screen flex-col`}>
        <ReduxProvider>
          <SessionProvider>
            <ReactQueryClientProvider>
              <GlobalLoading />
              <Toaster />
              <DownloadAppProvider>
                <LocationProvider>
                  <AuthDialogProvider>
                    <SelectedCategoryProvider>
                      <div className="relative flex min-h-screen flex-col">
                        <div className="z-50 border-b border-gray-100 bg-white/95 backdrop-opacity-50 md:sticky md:top-0">
                          {/* Mobile */}
                          <div className="mx-4 mt-5 inline-flex w-[calc(100%-2rem)] justify-between md:hidden">
                            <div className="inline-flex cursor-pointer items-center justify-center md:hidden">
                              <Link href="/" className="inline-flex items-center">
                                <Image
                                  src="/images/logo.svg"
                                  alt="Tukai logo"
                                  width={100}
                                  height={100}
                                />
                              </Link>
                            </div>
                            <UserLocation />
                            <AuthActions />
                          </div>
                          <div className="mx-4 md:hidden">
                            <Suspense
                              fallback={
                                <div className="h-10 w-full animate-pulse rounded-full bg-gray-200" />
                              }
                            >
                              <Search />
                            </Suspense>
                          </div>
                          {/* Browser */}
                          <div className="hidden md:grid md:grid-cols-12 md:gap-x-4">
                            <header className="flex items-center gap-4 py-3 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
                              <Link href="/" className="flex-shrink-0">
                                <Image
                                  src="/images/logo.svg"
                                  alt="Tukai logo"
                                  width={100}
                                  height={40}
                                  className="h-10 w-[100px] shrink-0"
                                />
                              </Link>
                              <Nav />
                              {/* Capped: on flex-1 alone the field absorbed every
                                  pixel the rest of the header did not use, so it
                                  stretched far wider than a search bar needs on a
                                  large screen */}
                              <div className="min-w-0 max-w-xl flex-1">
                                <Suspense
                                  fallback={
                                    <div className="h-10 w-full animate-pulse rounded-full bg-gray-200" />
                                  }
                                >
                                  <Search />
                                </Suspense>
                              </div>
                              {/* Keeps the trailing controls on the right edge once
                                  the search stops growing */}
                              <AskTukaiButton className="ml-auto" />
                              <AuthActions />
                            </header>
                          </div>
                        </div>
                        <Suspense fallback={<PillsSkeleton />}>
                          <PageFilters />
                        </Suspense>
                        <LocationPrompt />
                        <div className="mb-20 flex-grow md:mb-0">{children}</div>
                        <Footer />
                      </div>
                      <DownloadApp />
                      <BottomNavigation />
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
