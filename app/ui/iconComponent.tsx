'use client';

import * as HugeIcons from '@hugeicons/react-pro';
import { HugeiconsProps } from '@hugeicons/react-pro';
import React from 'react';

type IconName = keyof typeof HugeIcons;
function isValidIconName(name: string): name is IconName {
  return name in HugeIcons;
}
export default function IconComponent({
  iconName,
  size = 20,
  color = 'bg-gray-700',
  variant = 'twotone',
}: {
  iconName: string;
  size?: number;
  color?: string;
  variant?: string;
}) {
  if (isValidIconName(iconName)) {
    const IconComponent = HugeIcons[iconName] as React.FC<HugeiconsProps>;
    return <IconComponent variant={variant} size={size} color={color} />;
  }
  return null;
}
