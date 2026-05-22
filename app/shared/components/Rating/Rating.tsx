'use client';

import { StarIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';

export const Rating = ({
  rating,
  showCount = false,
  showMultiStar = false,
}: {
  rating: number;
  showCount?: boolean;
  showMultiStar?: boolean;
}) => {
  return (
    <>
      {showMultiStar ? (
        Array.from({ length: rating }).map((_, index) => (
          <StarIcon
            key={index}
            variant="solid"
            size={14}
            className={clsx('mr-0.5', {
              'text-yellow-400': rating > 0,
              'text-gray-300': rating === 0,
            })}
          />
        ))
      ) : (
        <StarIcon
          variant="solid"
          size={14}
          className={clsx('mr-1', {
            'text-yellow-400': rating > 0,
            'text-gray-300': rating === 0,
          })}
        />
      )}
      {showCount && <span className="text-sm font-medium">{rating}</span>}
    </>
  );
};
