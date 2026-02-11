'use client';

import React from 'react';

import * as Icons from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';

type IconName = keyof typeof Icons;
function isValidIconName(name: string): name is IconName {
  return name in Icons;
}

export default function IconComponent({
  iconName,
  size = 20,
  color = 'bg-gray-700',
  className,
}: {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
}) {
  if (isValidIconName(iconName)) {
    const iconComponent = Icons[iconName];
    return <HugeiconsIcon icon={iconComponent} size={size} color={color} className={className} />;
  }
  return null;
}
