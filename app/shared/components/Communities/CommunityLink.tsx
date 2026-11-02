'use client';

import { MouseEvent, ReactNode } from 'react';

import Link from 'next/link';

import { OpenCommunityOptions, useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { communityPath } from '@/utils/detail-paths';

/**
 * The click handler that opens a community in the drawer instead of following
 * its link - or undefined outside the drawer's provider, where the link should
 * simply work.
 */
export const useOpenCommunityClick = (
  community: { id: string },
  options?: OpenCommunityOptions,
) => {
  const drawer = useCommunityDrawer();
  if (!drawer) return undefined;

  return (event: MouseEvent<HTMLAnchorElement>) => {
    // A modifier asks the browser for something else - a new tab, a new window
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    // Keeps nextjs-toploader's sibling listener on `document` from starting the
    // top bar for a click that opens the drawer - see ExperienceCard
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    drawer.openCommunity(community.id, options);
  };
};

/**
 * A link to a community that opens it in the drawer instead. It keeps its
 * href, so a modifier-click or a new tab still lands on the full page.
 */
export const CommunityLink = ({
  community,
  className,
  ariaLabel,
  drawerOptions,
  children,
}: {
  community: { id: string; slug?: string };
  className?: string;
  ariaLabel?: string;
  /** Set to stack the community on top of the drawer this sits in. */
  drawerOptions?: OpenCommunityOptions;
  children: ReactNode;
}) => {
  const onClick = useOpenCommunityClick(community, drawerOptions);

  return (
    <Link
      href={communityPath(community)}
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </Link>
  );
};
