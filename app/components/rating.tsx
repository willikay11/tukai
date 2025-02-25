'use client';

import { StarIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';
const Rating = ({ rating }: { rating: number }) => {
  return (
    <StarIcon
      variant="solid"
      size={14}
      className={clsx('mr-1', {
        'text-yellow-400': rating > 0,
        'text-gray-300': rating === 0,
      })}
    />
  );
};

export default Rating;
