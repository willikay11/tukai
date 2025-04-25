'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MinusSignCircleTwotoneRounded,
  PlusSignCircleTwotoneRounded,
} from '@hugeicons-pro/core-twotone-rounded';
import clsx from 'clsx';

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number, type: 'increase' | 'decrease') => void;
}

export default function Quantity({
  initialValue = 1,
  min = 1,
  max = 999,
  onChange,
}: QuantitySelectorProps) {
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

  return (
    <div className="inline-flex items-center justify-between rounded-full p-2">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="cursor-pointer"
      >
        <HugeiconsIcon
          icon={MinusSignCircleTwotoneRounded}
          size={20}
          className={clsx(quantity <= min && 'text-gray-300')}
        />
      </button>
      <span className="mx-2 min-w-[1ch] text-center text-sm font-medium">{quantity}</span>
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className="cursor-pointer"
      >
        <HugeiconsIcon
          icon={PlusSignCircleTwotoneRounded}
          size={20}
          className={clsx(quantity >= max && 'text-gray-300')}
        />
      </button>
    </div>
  );
}
