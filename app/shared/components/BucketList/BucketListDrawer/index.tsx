'use client';

import { useEffect, useRef } from 'react';

import { Drawer } from '@/components/ui/drawer';

import {
  BucketListCreateView,
  BucketListCreatedView,
  BucketListEditView,
} from './BucketListFormView';
import { BucketListInviteView } from './BucketListInviteView';
import { BucketListMembersView } from './BucketListMembersView';
import { BucketListView } from './BucketListView';
import { BucketListNav, BucketListScreen } from './bucket-list-drawer';

export type { BucketListNav, BucketListScreen } from './bucket-list-drawer';

const screenKey = (screen: BucketListScreen, depth: number) =>
  `${depth}:${screen.kind}:${'id' in screen ? screen.id : ''}`;

/**
 * The bucket list panel - a list, and whatever is opened on top of it.
 *
 * Only the top screen of the stack is drawn. Each screen is keyed by its place
 * in the stack, so going Back rebuilds the one below fresh, and the body
 * scrolls back to the top whenever a screen opens or comes off.
 */
export const BucketListDrawer = ({
  stack,
  isOpen,
  nav,
}: {
  stack: BucketListScreen[];
  isOpen: boolean;
  nav: BucketListNav;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const top = stack[stack.length - 1];
  const key = top ? screenKey(top, stack.length) : '';

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [key]);

  return (
    <Drawer
      isOpen={isOpen && Boolean(top)}
      setIsOpen={(next) => !next && nav.close()}
      width="medium"
      panelRef={panelRef}
    >
      {top?.kind === 'list' && <BucketListView key={key} bucketListId={top.id} nav={nav} />}
      {top?.kind === 'members' && (
        <BucketListMembersView key={key} bucketListId={top.id} nav={nav} />
      )}
      {top?.kind === 'invite' && <BucketListInviteView key={key} bucketListId={top.id} nav={nav} />}
      {top?.kind === 'edit' && <BucketListEditView key={key} bucketListId={top.id} nav={nav} />}
      {top?.kind === 'create' && <BucketListCreateView key={key} nav={nav} />}
      {top?.kind === 'created' && <BucketListCreatedView key={key} screen={top} nav={nav} />}
    </Drawer>
  );
};
