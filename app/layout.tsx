import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { satoshi } from '@/app/components/fonts';
import Image from 'next/image';
import Nav from '@/app/components/nav';
import AuthActions from '@/app/components/authActions';
import Link from 'next/link';
import GlobalLoading from '@/app/components/globalLoading';
import DownloadApp from '@/app/components/downloadApp';
import SessionProvider from '@/providers/SessionProvider';
import { ReduxProvider } from './redux-provider';
import IconRadioButtonGroup from '@/app/components/iconRadioButtonGroup';
import { hugeiconsLicense } from '@hugeicons/react-pro';
import ReactQueryClientProvider from '@/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/toaster';
import Search from './components/search';
import { DownloadAppProvider } from '@/context/DownloadAppContext';
import { SelectedCategoryProvider } from '@/context/SelectedCategoryContext';
import PageFilters from '@/components/ui/pageFilters';
import { PillsSkeleton } from './components/skeletons';
import { AuthDialogProvider } from '@/context/AuthDialogContext';

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
      <body className={satoshi.className}>
        <ReduxProvider>
          <SessionProvider>
            <ReactQueryClientProvider>
              <GlobalLoading />
              <Toaster />
              <DownloadAppProvider>
                <AuthDialogProvider>
                  <SelectedCategoryProvider>
                    <div className="sticky top-0 z-50 grid grid-cols-12 border-b-[1px] border-gray-100 bg-white md:gap-x-4">
                      <div className="col-span-12 md:hidden lg:hidden 2xl:hidden">
                        <DownloadApp />
                      </div>
                      <div className="col-span-12 mx-4 mt-5 inline-flex justify-between md:hidden lg:hidden 2xl:hidden">
                        <Nav />
                        <AuthActions />
                      </div>
                      <div className="col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
                        <div className="inline-flex grid h-[80px] w-full grid-cols-12 items-center justify-between md:mt-6">
                          <div className="flex hidden h-full items-center md:col-span-5 md:inline-flex lg:col-span-5 lg:inline-flex">
                            <Link href="/" className="hidden h-full items-center md:flex">
                              <Image
                                src="/images/logo.svg"
                                alt="Tukai logo"
                                width={80}
                                height={70}
                                className="md:mr-6 lg:mr-5 xl:mr-10"
                              />
                            </Link>
                            <Nav />
                          </div>
                          <div className="col-span-12 inline-flex justify-center md:col-span-4 lg:col-span-4">
                            <div className="w-full md:inline-flex">
                              <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-full bg-gray-200" />}>
                                <Search />
                              </Suspense>
                            </div>
                            <IconRadioButtonGroup />
                          </div>
                          <div className="flex hidden h-full items-center justify-end md:col-span-3 md:inline-flex lg:col-span-3 lg:inline-flex">
                            <AuthActions />
                          </div>
                        </div>
                      </div>
                      <Suspense fallback={<PillsSkeleton />}>
                        <PageFilters />
                      </Suspense>
                    </div>
                    {children}
                  </SelectedCategoryProvider>
                </AuthDialogProvider>
              </DownloadAppProvider>
            </ReactQueryClientProvider>
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
