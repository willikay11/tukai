'use client';

import React, { useEffect, useState } from 'react';

import clsx from 'clsx';

import { IconComponent } from '@/app/shared/components/Icons';
import { Interest } from '@/types/interest';

export const CategoryPill = ({
  category,
  onClick,
  isSelected,
}: {
  category: Interest;
  onClick: (id: string) => void;
  isSelected?: boolean;
}) => {
  const [active, setActive] = useState(isSelected ?? false);

  useEffect(() => {
    if (isSelected !== undefined) {
      setActive(isSelected);
    }
  }, [isSelected]);

  return (
    <div
      key={category.id}
      onClick={() => {
        onClick(category.id);
        setActive((prev) => !prev);
      }}
      className={clsx('inline-flex w-fit cursor-pointer items-center rounded-full px-4 py-2', {
        'bg-primary text-white': active,
        'bg-gray-100': !active,
      })}
    >
      <div className="mr-2">
        {category?.icon && <IconComponent iconName={category.icon} size={16} />}
      </div>
      <span className="text-xs font-medium">{category.name}</span>
    </div>
  );
};
