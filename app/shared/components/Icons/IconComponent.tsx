'use client';

import React from 'react';

import * as BulkIcons from '@hugeicons-pro/core-bulk-rounded';
import * as DuotoneIcons from '@hugeicons-pro/core-duotone-rounded';
import * as SolidIcons from '@hugeicons-pro/core-solid-rounded';
import * as Icons from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';

/**
 * The style is the PACKAGE an icon comes from, not a prop on the icon - so a
 * variant exists here only once its package is a dependency. `twotone` is the
 * default, unselected look. `bulk` is the filled-with-a-tinted-counterpart
 * style the designs use for a control that is already switched on (the
 * active tab, a liked heart, a verified badge). `duotone` is reserved for the
 * Create menu and the "Share moment" trigger - nowhere else uses it.
 *
 * All four are `import * as`, indexed by a runtime string, so the bundler
 * ships every icon in each package rather than tree-shaking to what's used.
 * That's the deliberate tradeoff for having every variant available on every
 * icon instead of maintaining a hand-picked subset per style.
 */
type TwotoneIconName = keyof typeof Icons;
type SolidIconName = keyof typeof SolidIcons;
type BulkIconName = keyof typeof BulkIcons;
type DuotoneIconName = keyof typeof DuotoneIcons;

function isValidTwotoneIconName(name: string): name is TwotoneIconName {
  return name in Icons;
}

function isValidSolidIconName(name: string): name is SolidIconName {
  return name in SolidIcons;
}

function isValidBulkIconName(name: string): name is BulkIconName {
  return name in BulkIcons;
}

function isValidDuotoneIconName(name: string): name is DuotoneIconName {
  return name in DuotoneIcons;
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
  variant?: 'solid' | 'twotone' | 'bulk' | 'duotone';
}) => {
  if (variant === 'bulk' && isValidBulkIconName(iconName)) {
    const iconComponent = BulkIcons[iconName];
    return <HugeiconsIcon icon={iconComponent} size={size} color={color} className={className} />;
  }
  if (variant === 'duotone' && isValidDuotoneIconName(iconName)) {
    const iconComponent = DuotoneIcons[iconName];
    return <HugeiconsIcon icon={iconComponent} size={size} color={color} className={className} />;
  }
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
