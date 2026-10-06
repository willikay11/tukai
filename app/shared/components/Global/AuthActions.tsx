'use client';

import { useEffect, useState } from 'react';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { SubscriptionModalFlow } from '@/app/shared/components/Subscription';
import { useUnreadNotificationCount } from '@/app/shared/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TukaiImage } from '@/components/ui/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthDialog } from '@/context/AuthDialogContext';

import { ProfileMenu } from './ProfileMenu';

export const AuthActions = () => {
  const { openSignInWithCallback } = useAuthDialog();
  const router = useRouter();
  const { data: session } = useSession();
  const [showJoinPremium, setShowJoinPremium] = useState(false);
  const [pendingCreateAfterLogin, setPendingCreateAfterLogin] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const hasSubscribed = Boolean(session?.user?.hasSubscribed);

  // The dot on the Notifications row was hardcoded true, so it was on for
  // everybody forever
  const { data: unreadResponse } = useUnreadNotificationCount(Boolean(session?.user?.id));
  const unreadCount = Number(unreadResponse?.data?.count ?? 0);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleCreateExperience = () => {
    if (session?.user) {
      if (!hasSubscribed) {
        setShowJoinPremium(true);
        return;
      }

      router.push('/experiences/create');
      return;
    }

    openSignInWithCallback(() => {
      setPendingCreateAfterLogin(true);
    });
  };

  useEffect(() => {
    if (!pendingCreateAfterLogin || !session?.user) return;

    if (hasSubscribed) {
      router.push('/experiences/create');
    } else {
      setShowJoinPremium(true);
    }

    setPendingCreateAfterLogin(false);
  }, [pendingCreateAfterLogin, session?.user, hasSubscribed, router]);

  /**
   * Create belongs to the signed-in bar. A visitor who has not joined yet is
   * asked to join - offering them Create only to answer with a sign-in dialog
   * is a door that opens onto another door.
   *
   * On a phone it is a round lime plus, and the word comes back from lg. The
   * word stays in the DOM as screen-reader text, so the control keeps its name.
   * Between md and lg it is hidden, as it was before.
   */
  const createButton = hasSubscribed ? (
    <Link
      href="/experiences/create"
      className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-lime text-sm font-semibold text-brand-ink transition-colors hover:bg-lime-dark md:hidden lg:inline-flex lg:w-auto lg:gap-2 lg:px-4"
    >
      <IconComponent iconName="Add01Icon" size={18} color="currentColor" />
      <span className="sr-only lg:not-sr-only">Create</span>
    </Link>
  ) : (
    <Button
      variant="lime"
      className="h-11 w-11 flex-shrink-0 items-center justify-center rounded-full p-0 text-sm font-semibold md:hidden lg:inline-flex lg:w-auto lg:gap-2 lg:px-4"
      onClick={handleCreateExperience}
    >
      <IconComponent iconName="Add01Icon" size={18} color="currentColor" />
      <span className="sr-only lg:not-sr-only">Create</span>
    </Button>
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
              className="flex h-11 flex-shrink-0 items-center gap-2 rounded-full border border-line-soft bg-white pl-[5px] pr-[5px] outline-none md:pl-3 transition-shadow hover:shadow-[0_2px_10px_rgba(1,51,52,.09)]"
            >
              <IconComponent
                iconName="Menu02Icon"
                size={18}
                color="currentColor"
                className="hidden text-gray-800 md:block"
              />
              <div className="relative aspect-square h-8 w-8">
                <TukaiImage
                  src={session?.user?.image || ''}
                  alt={session?.user?.name || ''}
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
                name={session.user.name ?? ''}
                handle={session.user.displayName}
                image={session.user.image}
                hasUnreadNotifications={unreadCount > 0}
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
           account, and one for whoever does not. */
        <>
          <Link
            href="/auth/sign-in"
            className="inline-flex h-11 flex-shrink-0 items-center rounded-full border border-line bg-white px-[18px] text-sm font-semibold text-brand-ink transition-colors hover:bg-surface"
          >
            Sign in
          </Link>

          <Link href="/auth/sign-up" className="inline-flex">
            <Button
              variant="gradient"
              className="h-11 flex-shrink-0 rounded-full px-[18px] text-sm font-semibold"
            >
              Create account
            </Button>
          </Link>
        </>
      )}

      <Dialog open={showJoinPremium} onOpenChange={setShowJoinPremium}>
        <DialogContent className="w-[calc(100%-35px)] max-w-[620px] border-0 bg-transparent p-0 shadow-none">
          {/* Steps reset automatically - Radix unmounts content on close */}
          <SubscriptionModalFlow onClose={() => setShowJoinPremium(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
