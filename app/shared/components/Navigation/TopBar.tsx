'use client';

import { Suspense, useEffect, useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AuthActions } from '@/app/shared/components/Global/AuthActions';
import { Search } from '@/app/shared/components/Search';
import { cn } from '@/lib/utils';

import { Nav } from './Nav';
import { DISCOVER_TABS } from './tabs';

/**
 * The CSS variable sticky sub-bars read to sit directly under this bar: the
 * Discover filter row, the category chips, the search results bar and the
 * profile tabs. The bar's height changes with the width and, on a phone, with
 * whether the search shows, so no fixed number holds.
 */
export const TOP_BAR_HEIGHT_VAR = '--top-bar-h';

/**
 * Discover's own four faces, and only those - a single experience or place
 * beneath them is a detail page, which the canvas treats as off Discover.
 */
const isOnDiscover = (pathname: string): boolean =>
  DISCOVER_TABS.some((tab) => tab.href === pathname);

/**
 * The app's top bar, one layout at every width.
 *
 * From 720px it is one line: the logo, Discover's tabs over the search, and
 * the account area. Below 720px the same row wraps: the logo and the account
 * area share the first line, and on Discover the search and then the tabs
 * take a full-width line each. Off Discover a phone shows the first line only.
 * Everything here switches in CSS, so a phone gets its own layout on the
 * first paint.
 */
export const TopBar = () => {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const onDiscover = isOnDiscover(pathname);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const root = document.documentElement;
    const measure = () =>
      root.style.setProperty(
        TOP_BAR_HEIGHT_VAR,
        `${Math.round(bar.getBoundingClientRect().height)}px`,
      );

    measure();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      root.style.removeProperty(TOP_BAR_HEIGHT_VAR);
    };
  }, []);

  return (
    <div
      ref={barRef}
      data-top-bar
      className="sticky top-0 z-30 border-b border-surface-muted bg-white/[.96] backdrop-blur-[12px]"
    >
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 min-[720px]:flex-nowrap min-[720px]:items-start min-[720px]:px-6 min-[720px]:pb-5 min-[720px]:pt-[30px]">
        <Link href="/" className="flex h-11 flex-shrink-0 items-center">
          <Image
            src="/images/logo.svg"
            alt="Tukai logo"
            width={106}
            height={35}
            className="h-[30px] w-auto shrink-0"
          />
        </Link>

        {/* Third on a phone, so it wraps under the logo and the account area
            onto lines of its own */}
        <div
          className={cn(
            'order-3 min-w-0 flex-[1_1_100%] flex-col items-stretch gap-3',
            'min-[720px]:order-none min-[720px]:flex min-[720px]:flex-[1_1_auto] min-[720px]:items-center min-[720px]:gap-[18px]',
            onDiscover ? 'flex' : 'hidden',
          )}
        >
          {/* Under the search on a phone, edge to edge so the strip scrolls
              off the screen rather than stopping at the gutter. A block there,
              not a flex row: the strip will not shrink inside a flex row, and
              would push the page wider than the screen. */}
          <div className="order-2 -mx-4 min-w-0 px-4 min-[720px]:order-none min-[720px]:mx-0 min-[720px]:flex min-[720px]:max-w-full min-[720px]:justify-center min-[720px]:px-0">
            <Nav />
          </div>

          <div className="order-1 w-full min-[720px]:order-none">
            <Suspense
              fallback={
                <div className="mx-auto h-[50px] w-full max-w-[600px] animate-pulse rounded-full bg-gray-200 min-[720px]:h-[54px]" />
              }
            >
              <Search />
            </Suspense>
          </div>
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2 min-[720px]:ml-0">
          <AuthActions />
        </div>
      </div>
    </div>
  );
};
