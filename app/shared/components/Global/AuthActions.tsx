'use client';

import { useState } from 'react';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { MomentComposer } from '@/app/shared/components/Moments';
import { useUnreadNotificationCount } from '@/app/shared/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { TukaiImage } from '@/components/ui/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';
import { useCreateCommunityDrawer } from '@/context/CreateCommunityDrawerContext';
import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';

import { CreateMenu } from './CreateMenu';
import { CreateMenuItemId } from './CreateMenu/items';
import { ProfileMenu } from './ProfileMenu';

export const AuthActions = () => {
  const { needAuth, openSignIn, openRegister } = useAuthDialog();
  const { openConnectPlace } = useConnectPlaceDrawer()!;
  const { openCreateExperience } = useCreateExperienceDrawer()!;
  const { openCreateCommunity } = useCreateCommunityDrawer()!;
  const router = useRouter();
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isBucketListModalOpen, setIsBucketListModalOpen] = useState(false);
  const [isMomentComposerOpen, setIsMomentComposerOpen] = useState(false);

  // The dot on the Notifications row was hardcoded true, so it was on for
  // everybody forever
  const { data: unreadResponse } = useUnreadNotificationCount(Boolean(session?.user?.id));
  const unreadCount = Number(unreadResponse?.data?.count ?? 0);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // Needs a hosting plan and a community you own - openCreateExperience
  // itself opens the Hosting plan drawer first when the account has no
  // active plan (see context/CreateExperienceDrawerContext.tsx).
  const handleCreateExperience = () => {
    if (session?.user) {
      openCreateExperience();
      return;
    }

    needAuth('host', () => openCreateExperience());
  };

  // Closes the Create popover first, then does whatever the row promised - a
  // link row has already started navigating on its own by the time this runs.
  const handleCreateMenuSelect = (id: CreateMenuItemId) => {
    setIsCreateMenuOpen(false);

    if (id === 'experience') handleCreateExperience();
    if (id === 'community') openCreateCommunity();
    if (id === 'place') openConnectPlace();
    if (id === 'bucketList') setIsBucketListModalOpen(true);
    if (id === 'moment') setIsMomentComposerOpen(true);
  };

  /**
   * Create belongs to the signed-in bar. A visitor who has not joined yet is
   * asked to join - offering them Create only to answer with a sign-in dialog
   * is a door that opens onto another door.
   *
   * Below 720px it is a round lime plus; the word comes back at 720px and up.
   * The word stays in the DOM as screen-reader text below that, so the
   * control keeps its name either way.
   */
  const createButton = (
    <Popover open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
      <PopoverTrigger
        aria-label="Create"
        aria-haspopup="menu"
        aria-expanded={isCreateMenuOpen}
        className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center gap-2 rounded-full bg-lime px-0 text-sm font-semibold text-brand-ink outline-none transition-colors hover:bg-lime-dark min-[720px]:w-auto min-[720px]:px-4"
      >
        <IconComponent iconName="AddCircleIcon" size={18} color="currentColor" />
        <span className="sr-only min-[720px]:not-sr-only">Create</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-auto rounded-2xl p-0"
      >
        <CreateMenu onSelect={handleCreateMenuSelect} />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex items-center gap-2">
      {session?.user ? (
        // Popover rather than NavigationMenu: the avatar sits at the right edge
        // of the header, and NavigationMenu anchors its viewport left-0 with no
        // way to align it per usage, so a 300px panel ran off-screen. Popover
        // aligns to the trigger's end and handles collisions.
        <>
          {createButton}

          <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            {/* The canvas's account chip: one bordered pill carrying the menu
              and the reader's face. The menu icon is what says the rest of the
              app is behind it, which a bare avatar does not. */}
            <PopoverTrigger
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              className="flex h-11 flex-shrink-0 items-center gap-2 rounded-full border border-line-soft bg-white pl-[5px] pr-[5px] outline-none transition-shadow hover:shadow-[0_2px_10px_rgba(1,51,52,.09)] min-[720px]:pl-3"
            >
              <IconComponent
                iconName="Menu02Icon"
                size={18}
                color="currentColor"
                className="hidden text-gray-800 min-[720px]:block"
              />
              <div className="relative aspect-square h-8 w-8">
                <TukaiImage
                  src={session?.user?.image || ''}
                  // The button is already named "Account menu" via aria-label
                  // above, so the photo need not repeat the person's name
                  alt=""
                  className="h-8 w-8 rounded-full"
                  quality={100}
                  fill
                  style={{ objectFit: 'cover' }}
                  showNotFoundText={false}
                />
              </div>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              collisionPadding={12}
              className="w-auto rounded-2xl p-0"
            >
              <ProfileMenu
                unreadNotificationCount={unreadCount}
                onSignOut={handleLogout}
                // Client navigation leaves the popover mounted, so choosing a row
                // has to close it explicitly
                onItemSelect={() => setIsProfileOpen(false)}
              />
            </PopoverContent>
          </Popover>
        </>
      ) : (
        /* Two doors, as the design has them: one for whoever already has an
           account, and one for whoever does not. Create account hides below
           720px per the design's top bar spec; Sign in shows at every width. */
        <>
          <button
            type="button"
            onClick={openSignIn}
            className="inline-flex h-11 flex-shrink-0 items-center rounded-full border border-line bg-white px-[18px] text-sm font-semibold text-brand-ink transition-colors hover:bg-surface"
          >
            Sign in
          </button>

          <Button
            type="button"
            onClick={openRegister}
            variant="gradient"
            className="hidden h-11 flex-shrink-0 rounded-full px-[18px] text-sm font-semibold min-[720px]:inline-flex"
          >
            Create account
          </Button>
        </>
      )}

      <CreateBucketListModal open={isBucketListModalOpen} onOpenChange={setIsBucketListModalOpen} />

      {/* Opened with no context, same as the Discover page's own "Been
          somewhere good?" tile - the moment posts untagged */}
      <MomentComposer open={isMomentComposerOpen} onOpenChange={setIsMomentComposerOpen} />
    </div>
  );
};
