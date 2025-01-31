'use client';
import Image from 'next/image';
import { Bookmark02Icon, StarIcon } from '@hugeicons/react-pro';
import { Experience } from '@/app/lib/definitions';
import { useState } from 'react';
import clsx from 'clsx';

export default function SingleExperience({ experience }: { experience: Experience }) {
  const [rated, setRated] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  return (
    <>
      <div className="relative mb-2 flex flex-col">
        <Image
          src={experience.photos.find((photo) => photo.isCover)?.photo ?? ''}
          height={500}
          width={500}
          alt={experience.title}
          className="rounded-[5px]"
          quality={100}
        />
        <div
          className="absolute right-2 top-2 cursor-pointer"
          onClick={() => setBookmarked(!bookmarked)}
        >
          <Bookmark02Icon
            size={16}
            className={clsx('', {
              'text-white': !bookmarked,
              'text-red-600': bookmarked,
            })}
            variant={bookmarked ? 'solid' : 'twotone'}
          />
        </div>
      </div>
      <div className="flex flex-col items-start justify-start bg-white">
        <div className="mb-1 flex">
          <p className="text-xs font-bold text-gray-800">{experience.title}</p>
        </div>
        <div className="mb-1 inline-flex items-center">
          <span className="text-xs text-gray-600">{experience.location.name}</span>
          <div className="mx-1 h-[6px] w-[1px] rounded bg-gray-300" />
          {/*<span className="text-xs text-gray-600">{experience.distance}</span>*/}
          {/*<div className="mx-1 h-[6px] w-[1px] rounded bg-gray-300" />*/}
          {/*<span className="text-xs text-gray-600">{experience.duration}</span>*/}
        </div>
        <div className="inline-flex items-center">
          <StarIcon
            variant="solid"
            size={14}
            className={clsx('mr-1', {
              'text-yellow-400': rated,
              'text-gray-300': !rated,
            })}
            onClick={() => setRated(!rated)}
          />
          {/*<span className="text-xs text-gray-600">{experience.rating}</span>*/}
          {/*<div className="mx-1 h-[6px] w-[1px] rounded bg-gray-300" />*/}
          {/*<span className="text-xs text-gray-600">{experience.reviews} Reviews</span>*/}
        </div>
      </div>
    </>
  );
}
