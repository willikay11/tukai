'use client';
import React, { Suspense } from 'react';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

const backgroundImages = [
  {
    image: '/images/hill-decent.webp',
    path: '/auth/sign-in',
  },
  {
    image: '/images/hill-decent.webp',
    path: '/auth/forgot-password',
  },
  {
    image: '/images/hill-decent.webp',
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
  {
    image: '/images/man-bridge-running.webp',
    path: '/auth/terms-of-service',
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
    <div className="h-screen">
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
          height: '115vh',
          objectFit: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }}
      />
      <div className="mt-4 flex flex-col items-center justify-center md:mt-12">
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
