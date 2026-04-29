'use client';

import React from 'react';

import * as SolidIcons from '@hugeicons-pro/core-solid-rounded';
import * as Icons from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';

type TwotoneIconName = keyof typeof Icons;
type SolidIconName = keyof typeof SolidIcons;

function isValidTwotoneIconName(name: string): name is TwotoneIconName {
  return name in Icons;
}

function isValidSolidIconName(name: string): name is SolidIconName {
  return name in SolidIcons;
}

export const IconComponent = ({
  iconName,
  size = 20,
  color = 'bg-gray-700',
  className,
  variant = 'twotone',
}: {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
  variant?: 'solid' | 'twotone';
}) => {
  if (variant === 'solid' && isValidSolidIconName(iconName)) {
    const iconComponent = SolidIcons[iconName];
    return <HugeiconsIcon icon={iconComponent} size={size} color={color} className={className} />;
  }
  if (variant === 'twotone' && isValidTwotoneIconName(iconName)) {
    const iconComponent = Icons[iconName];
    return <HugeiconsIcon icon={iconComponent} size={size} color={color} className={className} />;
  }
  return null;
};
