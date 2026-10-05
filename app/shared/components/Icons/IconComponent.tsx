'use client';

import React from 'react';

import { ShoppingBasketDone02Icon } from '@hugeicons-pro/core-bulk-rounded';
import * as SolidIcons from '@hugeicons-pro/core-solid-rounded';
import * as Icons from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';

/**
 * The style is the PACKAGE an icon comes from, not a prop on the icon — so a
 * variant exists here only once its package is a dependency. `bulk` is the
 * filled-with-a-tinted-counterpart style the designs use for a control that is
 * already switched on, where `twotone` is the same icon switched off.
 *
 * ⚠️ Named imports, not `import * as`. The two wildcard imports below are
 * indexed by a runtime string, so the bundler cannot tell which icons are
 * reachable and ships all of them — which is most of this app's First Load JS.
 * Adding a third set that way cost 3.5MB a route. Bulk is used by one control,
 * so it lists the one icon; add a line here when another needs it.
 */
const BULK_ICONS = { ShoppingBasketDone02Icon };

type TwotoneIconName = keyof typeof Icons;
type SolidIconName = keyof typeof SolidIcons;
type BulkIconName = keyof typeof BULK_ICONS;

function isValidTwotoneIconName(name: string): name is TwotoneIconName {
  return name in Icons;
}

function isValidSolidIconName(name: string): name is SolidIconName {
  return name in SolidIcons;
}

function isValidBulkIconName(name: string): name is BulkIconName {
  return name in BULK_ICONS;
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
  variant?: 'solid' | 'twotone' | 'bulk';
}) => {
  if (variant === 'bulk' && isValidBulkIconName(iconName)) {
    const iconComponent = BULK_ICONS[iconName];
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
