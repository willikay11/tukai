'use client';

import { useEffect, useState } from 'react';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

/**
 * The style is the PACKAGE an icon comes from, not a prop on the icon - so a
 * variant exists here only once its package is a dependency. `twotone` is the
 * default, unselected look. `bulk` is the filled-with-a-tinted-counterpart
 * style the designs use for a control that is already switched on (the
 * active tab, a liked heart, a verified badge). `duotone` is reserved for the
 * Create menu and the "Share moment" trigger - nowhere else uses it.
 *
 * Each package ships ~4,500-9,000 icons as one file each. Each one used to be
 * pulled in wholesale (`import * as Icons from '...'`), so the first route
 * that rendered any icon had to compile all four packages before it could
 * serve anything - tens of thousands of modules for icons the page never
 * draws. These loaders (the packages' own `/loader` entry point) resolve one
 * icon file at a time instead, so only what a page actually renders is ever
 * fetched. The cost is that an icon is not available on the very first paint
 * - it loads in just after, same as an image would - rather than always
 * having shipped with the page's own JS.
 */
type IconVariant = 'solid' | 'twotone' | 'bulk' | 'duotone';

type IconLoader = (name: string) => Promise<IconSvgElement>;

// Each package's loader resolves its own `IconSvgObject` type, structurally
// identical to `@hugeicons/react`'s `IconSvgElement` (both are just a
// readonly list of SVG tag/attribute tuples) but declared in a different
// package, hence the cast on the resolved value
const LOADERS: Record<IconVariant, IconLoader> = {
  twotone: (name) =>
    import('@hugeicons-pro/core-twotone-rounded/loader').then(
      (module) => module.loadIcon(name) as unknown as IconSvgElement,
    ),
  solid: (name) =>
    import('@hugeicons-pro/core-solid-rounded/loader').then(
      (module) => module.loadIcon(name) as unknown as IconSvgElement,
    ),
  bulk: (name) =>
    import('@hugeicons-pro/core-bulk-rounded/loader').then(
      (module) => module.loadIcon(name) as unknown as IconSvgElement,
    ),
  duotone: (name) =>
    import('@hugeicons-pro/core-duotone-rounded/loader').then(
      (module) => module.loadIcon(name) as unknown as IconSvgElement,
    ),
};

// Shared by every instance and never cleared - once an icon has loaded once
// for the session, every later render of it (any component, any page) is
// synchronous again
const cache = new Map<string, IconSvgElement>();

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
  variant?: IconVariant;
}) => {
  const cacheKey = `${variant}:${iconName}`;
  const [icon, setIcon] = useState<IconSvgElement | undefined>(() => cache.get(cacheKey));
  // Tracks which key `icon` belongs to, so a switch to an uncached icon (e.g.
  // an expand/collapse chevron flipping direction) clears the old one
  // straight away instead of showing it a beat longer under the new name
  const [iconKey, setIconKey] = useState(cacheKey);

  if (iconKey !== cacheKey) {
    setIconKey(cacheKey);
    setIcon(cache.get(cacheKey));
  }

  useEffect(() => {
    const cached = cache.get(cacheKey);
    if (cached) {
      setIcon(cached);
      return;
    }

    let cancelled = false;

    LOADERS[variant](iconName)
      .then((loaded) => {
        cache.set(cacheKey, loaded);
        if (!cancelled) setIcon(loaded);
      })
      .catch(() => {
        // An unknown name for this variant - same as the old lookup finding
        // nothing: render nothing rather than throw
        if (!cancelled) setIcon(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, iconName, variant]);

  if (!icon) return null;

  return <HugeiconsIcon icon={icon} size={size} color={color} className={className} />;
};
