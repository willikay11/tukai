import React from 'react';
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
              <div className="grid grid-cols-12 border-b-[1px] border-gray-100 bg-white md:gap-4">
                <DownloadApp />
                <div className="col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
                  <div className="inline-flex h-[80px] w-full items-center justify-between md:mt-6">
                    <div className="flex h-full items-center">
                      <Link href="/" className="hidden h-full items-center md:flex">
                        <Image
                          src="/images/logo.svg"
                          alt="Oltukai logo"
                          width={80}
                          height={70}
                          className="md:mr-6 lg:mr-10 xl:mr-20"
                        />
                      </Link>
                      <Nav />
                    </div>
                    <div className="inline-flex">
                      <div className="mr-2 hidden w-72 md:block">
                        <Search />
                      </div>
                      <IconRadioButtonGroup />
                    </div>
                    <div className="flex h-full items-center justify-end">
                      <AuthActions />
                    </div>
                  </div>
                </div>
              </div>
              {children}
            </ReactQueryClientProvider>
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
