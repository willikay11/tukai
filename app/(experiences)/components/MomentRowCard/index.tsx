'use client';

import Image from 'next/image';

import { Moment, momentAuthorName } from '@/types/moment';

interface MomentRowCardProps {
  moment: Moment;
  onClick: () => void;
}

export const MomentRowCard = ({ moment, onClick }: MomentRowCardProps) => {
  // Callers filter out media-less moments, so this is always present
  const photo = moment.media[0]?.photo;
  const authorName = momentAuthorName(moment.author);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block aspect-square w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-2xl"
    >
      {photo ? (
        <Image
          src={photo}
          alt={moment.title}
          fill
          sizes="280px"
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full bg-gray-100" />
      )}

      {/* Bottom gradient so the author chip stays readable on light photos */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white/80">
          {moment.author.picture ? (
            <Image
              src={moment.author.picture}
              alt={authorName}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            // No placeholder avatar asset exists — fall back to the initial,
            // the same treatment AvatarStack uses
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-600">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white drop-shadow">{authorName}</span>
      </div>
    </button>
  );
};
