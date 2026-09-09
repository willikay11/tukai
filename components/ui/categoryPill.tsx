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
      className={clsx(
        'inline-flex w-fit cursor-pointer items-center rounded-full px-4 py-2 transition-all duration-300 ease-in-out',
        {
          // The same gradient a chosen pill takes everywhere else — the pill
          // radio group, the property pills and the gradient button
          'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-sm': active,
          'border border-gray-100 bg-gray-100 text-gray-700 hover:text-gray-900': !active,
        },
      )}
    >
      <div className="mr-2">
        {/* currentColor so the icon turns with the pill rather than staying grey */}
        {category?.icon && (
          <IconComponent iconName={category.icon} size={16} color="currentColor" />
        )}
      </div>
      <span className="text-xs font-medium">{category.name}</span>
    </div>
  );
};
