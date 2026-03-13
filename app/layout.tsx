import React, { Suspense } from 'react';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { hugeiconsLicense } from '@hugeicons/react-pro';

import AuthActions from '@/app/components/authActions';
import BottomNavigation from '@/app/components/bottomNavigation';
import DownloadApp from '@/app/components/downloadApp';
import { satoshi } from '@/app/components/fonts';
import GlobalLoading from '@/app/components/globalLoading';
import IconRadioButtonGroup from '@/app/components/iconRadioButtonGroup';
import PageFilters from '@/components/ui/pageFilters';
import { Toaster } from '@/components/ui/toaster';
import { AuthDialogProvider } from '@/context/AuthDialogContext';
import { DownloadAppProvider } from '@/context/DownloadAppContext';
import { LocationProvider } from '@/context/LocationContext';
import { SelectedCategoryProvider } from '@/context/SelectedCategoryContext';
import ReactQueryClientProvider from '@/providers/ReactQueryProvider';
import SessionProvider from '@/providers/SessionProvider';

import LocationPrompt from './components/locationPrompt';
import Nav from './components/nav';
import Search from './components/search';
import Footer from './components/share/footer';
import { PillsSkeleton } from './components/skeletons';
import UserLocation from './components/userLocation';
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
                        <div className="z-50 grid grid-cols-12 bg-gray-50 md:sticky md:top-0 md:gap-x-4">
                          {/* Mobile */}
                          <div className="col-span-12 mx-4 mt-5 inline-flex justify-between md:hidden lg:hidden 2xl:hidden">
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
                          {/* Browser */}
                          <div className="col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
                            <div className="inline-flex grid w-full grid-cols-12 items-center justify-between md:mt-6 md:h-fit">
                              <div className="flex hidden h-full items-start md:col-span-3 md:inline-flex lg:col-span-4 lg:inline-flex">
                                <Link
                                  href="/"
                                  className="hidden h-full shrink-0 items-start md:mr-6 md:flex lg:mr-3 xl:mr-6"
                                >
                                  <Image
                                    src="/images/logo.svg"
                                    alt="Tukai logo"
                                    width={100}
                                    height={40}
                                    className="mt-2 h-10 w-[100px] shrink-0"
                                  />
                                </Link>
                                <UserLocation />
                              </div>
                              <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                <div className="flex flex-col items-center space-y-6">
                                  <div className="flex w-full items-center gap-2 md:max-w-sm">
                                    <div className="flex-1">
                                      <Suspense
                                        fallback={
                                          <div className="h-10 w-full animate-pulse rounded-full bg-gray-200" />
                                        }
                                      >
                                        <Search />
                                      </Suspense>
                                    </div>
                                    <IconRadioButtonGroup />
                                  </div>
                                  <div className="flex w-full items-center justify-center md:max-w-sm">
                                    <Nav />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex hidden h-full items-start justify-end md:col-span-3 md:inline-flex lg:col-span-4 lg:inline-flex">
                                <AuthActions />
                              </div>
                            </div>
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
