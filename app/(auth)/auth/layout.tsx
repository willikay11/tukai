'use client';
import React, { Suspense, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';

const backgroundImages = [
  {
    image: '/images/hill-descent.webp',
    path: '/auth/sign-in',
  },
  {
    image: '/images/hill-descent.webp',
    path: '/auth/forgot-password',
  },
  {
    image: '/images/hill-descent.webp',
    path: '/auth/reset-password',
  },
  {
    image: '/images/hikers-walking.webp',
    path: '/auth/sign-up',
  },
  {
    image: '/images/infinite-pool.webp',
    path: '/auth/sign-up-free',
  },
  {
    image: '/images/kilimanjaro.webp',
    path: '/auth/interests',
  },
  {
    image: '/images/man-bridge-running.webp',
    path: '/auth/payments',
  },
  {
    image: '/images/santorini.webp',
    path: '/auth/subscribe',
  },
  {
    image: '/images/santorini.webp',
    path: '/auth/otp-confirmation',
  },
];

const options = [
  {
    label: 'Night life',
    class: 'text-blue-400',
  },
  {
    label: 'Hiking',
    class: 'text-teal-400',
  },
  {
    label: 'Camping',
    class: 'text-yellow-400',
  },
];

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const animationElement = useRef<any>();
  const [optionIndex, setOptionIndex] = useState<number>(0);

  useEffect(() => {
    animationElement?.current.addEventListener('animationiteration', () => {
      setOptionIndex((optionIndex) => (optionIndex < options.length - 1 ? optionIndex + 1 : 0));
    });
  }, [animationElement]);

  return (
    <div className="h-full">
      {/* The way out. Without it the auth screens were a dead end on the web —
          a reader who opened one had only the browser's back button. */}
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-white px-6 py-4">
        <Link href="/" aria-label="Tukai home">
          <Image src="/images/logo.svg" alt="Tukai" width={96} height={28} priority />
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-medium text-gray-900 hover:text-gray-600"
        >
          <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          Close
        </Link>
      </header>

      <Image
        alt="Mountains"
        src={
          backgroundImages.find((backgroundImage) => backgroundImage.path === pathname)?.image ??
          'images/hill-decent.svg'
        }
        quality={100}
        width={100}
        height={100}
        sizes="100vw"
        className="top-6 md:top-20"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }}
      />
      <div className="mt-24 flex flex-col items-center justify-center pb-12 md:mt-32">
        <div className="mb-4 text-center">
          <p className="mb-2 text-4xl font-black text-white">Plan & Discover</p>
          <p
            ref={animationElement}
            className={`fade-in-out text-4xl font-black ${options[optionIndex].class}`}
          >
            {options[optionIndex].label}
          </p>
        </div>
        <div className="mx-2.5 rounded-[15px] bg-white md:mx-0 md:w-[30.938rem]">
          <div className="px-8 py-8 md:px-16">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
    >
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  );
}
