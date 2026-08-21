'use client';

import { useEffect, useState } from 'react';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { SubscriptionModalFlow } from '@/app/shared/components/Subscription';
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

  const hasSubscribed = Boolean(session?.user?.hasSubscribed);

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

  return (
    <div className="flex items-center">
      {hasSubscribed ? (
        <Link
          href="/experiences/create"
          className="mr-2 hidden h-11 flex-shrink-0 items-center gap-1.5 rounded-full bg-lime px-6 text-sm text-gray-900 md:inline-flex"
        >
          <IconComponent iconName="PlusSignIcon" size={16} className="text-gray-900" />
          Create
        </Link>
      ) : (
        <Button
          variant="lime"
          className="mr-2 hidden h-11 flex-shrink-0 items-center gap-1.5 rounded-full bg-lime px-6 text-sm text-gray-900 md:inline-flex"
          onClick={handleCreateExperience}
        >
          <IconComponent iconName="PlusSignIcon" size={16} className="text-gray-900" />
          Create
        </Button>
      )}
      {session?.user ? (
        // Popover rather than NavigationMenu: the avatar sits at the right edge
        // of the header, and NavigationMenu anchors its viewport left-0 with no
        // way to align it per usage, so a 300px panel ran off-screen. Popover
        // aligns to the trigger's end and handles collisions.
        <Popover>
          <PopoverTrigger className="flex h-11 flex-shrink-0 items-center gap-1.5 rounded-full outline-none">
            <div className="relative aspect-square h-9 w-9">
              <TukaiImage
                src={session?.user?.image || ''}
                alt={session?.user?.name || ''}
                className="h-9 w-9 rounded-full"
                quality={100}
                fill
                style={{ objectFit: 'cover' }}
                showNotFoundText={false}
              />
            </div>
            <IconComponent
              iconName="ArrowDown01Icon"
              size={16}
              color="currentColor"
              className="text-gray-600"
            />
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
              hasUnreadNotifications
              onSignOut={handleLogout}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Link href="/auth/sign-in" className="inline-flex">
          <Button className="h-[38px] rounded-[68px]">Sign In/Sign Up</Button>
        </Link>
      )}

      <Dialog open={showJoinPremium} onOpenChange={setShowJoinPremium}>
        <DialogContent className="w-[calc(100%-35px)] max-w-[620px] border-0 bg-transparent p-0 shadow-none">
          {/* Steps reset automatically — Radix unmounts content on close */}
          <SubscriptionModalFlow onClose={() => setShowJoinPremium(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
