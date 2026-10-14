'use client';

import { useState } from 'react';

import {
  MinusSignCircleTwotoneRounded,
  PlusSignCircleTwotoneRounded,
} from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number, type: 'increase' | 'decrease') => void;
}

export const Quantity = ({
  initialValue = 1,
  min = 1,
  max = 999,
  onChange,
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialValue);

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue, 'decrease');
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue, 'increase');
    }
  };

  // The pill itself reads as off/on - grey at the floor, the same mint green
  // as a chosen pick elsewhere once at least one is taken
  const isEmpty = quantity <= min;

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-between rounded-full px-4 py-3',
        isEmpty ? 'bg-gray-100' : 'bg-emerald-100',
      )}
    >
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="cursor-pointer"
      >
        <HugeiconsIcon
          icon={MinusSignCircleTwotoneRounded}
          size={28}
          className={clsx(quantity <= min ? 'text-gray-300' : 'text-primary')}
        />
      </button>
      <span className="mx-4 min-w-[1ch] text-center text-xl font-bold text-gray-900">
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className="cursor-pointer"
      >
        <HugeiconsIcon
          icon={PlusSignCircleTwotoneRounded}
          size={28}
          className={clsx(quantity >= max ? 'text-gray-300' : 'text-primary')}
        />
      </button>
    </div>
  );
};
