'use client';
import React, { useEffect, useState } from 'react';
import Lightbox from 'react-18-image-lightbox';
import 'react-18-image-lightbox/style.css';

import clsx from 'clsx';

import { Photo } from '@/types/photo';

// This only needs to be imported once in your app
import TukaiImage from './image';

export const PhotoGallery = ({ photos }: { photos: Photo[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
    setIsLoading(true);
  };

  return (
    <>
      <div className="flex flex-col">
        <div
          className="relative mb-2 aspect-square h-[12.25rem] w-full md:h-[16.25rem]"
          onClick={() => handleImageClick(0)}
        >
          <TukaiImage
            src={photos?.find((photo: Photo) => photo.isCover)?.photo || photos[0]?.photo}
            alt=""
            quality={100}
            className={clsx(
              'cursor-pointer',
              photos?.length > 1 && 'rounded-tl-[15px] rounded-tr-[15px]',
              photos?.length === 1 && 'rounded-[15px]',
            )}
          />
        </div>
        <div
          className={clsx(
            'grid gap-2',
            photos?.length - 1 === 1 && 'grid-cols-1',
            photos?.length - 1 === 2 && 'grid-cols-2',
            photos?.length - 1 > 2 && 'grid-cols-3',
          )}
        >
          {photos[1]?.photo && (
            <div
              className="relative aspect-square h-[4rem] w-full md:h-[6.25rem]"
              onClick={() => handleImageClick(1)}
            >
              <TukaiImage
                src={photos?.[1].photo}
                alt=""
                quality={100}
                className={clsx(
                  'cursor-pointer rounded-bl-[15px]',
                  photos?.length - 1 === 1 && 'rounded-br-[15px]',
                )}
              />
            </div>
          )}

          {photos?.[2]?.photo && (
            <div
              className="relative aspect-square h-[4rem] w-full md:h-[6.25rem]"
              onClick={() => handleImageClick(2)}
            >
              <TukaiImage
                src={photos?.[2].photo}
                alt=""
                quality={100}
                className={clsx('cursor-pointer', photos?.length - 1 === 2 && 'rounded-br-[15px]')}
              />
            </div>
          )}

          {photos[3]?.photo && (
            <div
              className="relative aspect-square h-[4rem] w-full md:h-[6.25rem]"
              onClick={() => handleImageClick(3)}
            >
              <TukaiImage
                src={photos?.[3].photo}
                alt=""
                quality={100}
                className="cursor-pointer rounded-br-[15px]"
              />
              {photos.length - 4 > 0 && (
                <div className="absolute bottom-0 left-0 right-0 top-0 flex cursor-pointer items-center justify-center">
                  <span className="text-sm font-black text-white">
                    +{photos?.length - 4} Photos
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <Lightbox
          mainSrc={photos?.[photoIndex].photo}
          nextSrc={photos?.[(photoIndex + 1) % photos.length].photo}
          prevSrc={photos?.[(photoIndex + photos.length - 1) % photos.length].photo}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => {
            setPhotoIndex((photoIndex + photos?.length - 1) % photos.length);
            setIsLoading(true);
          }}
          onMoveNextRequest={() => {
            setPhotoIndex((photoIndex + 1) % photos?.length);
            setIsLoading(true);
          }}
          onImageLoad={() => setIsLoading(false)} // Hide spinner when image loads
        />
      )}
    </>
  );
};
