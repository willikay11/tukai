'use client';
import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

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

export const PageLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const animationElement = useRef<HTMLParagraphElement | null>(null);
  const [optionIndex, setOptionIndex] = useState<number>(0);

  useEffect(() => {
    const element = animationElement?.current;
    if (!element) return;
    const handleAnimationIteration = () => {
      setOptionIndex((optionIndex) => (optionIndex < options.length - 1 ? optionIndex + 1 : 0));
    };
    element.addEventListener('animationiteration', handleAnimationIteration);
    return () => {
      element.removeEventListener('animationiteration', handleAnimationIteration);
    };
  }, []);

  return (
    <div className="h-screen">
      <Image
        alt="Background image of a mountain descent"
        src="/images/hill-descent.webp"
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
};
