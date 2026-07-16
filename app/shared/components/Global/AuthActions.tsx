'use client';

import { useEffect, useState } from 'react';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { JoinTukaiPremium } from '@/app/shared/components/JoinTukaiPremium/JoinTukaiPremium';
import { SubscribeView } from '@/app/shared/components/Subscription';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TukaiImage } from '@/components/ui/image';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAuthDialog } from '@/context/AuthDialogContext';

export const AuthActions = () => {
  const { openSignInWithCallback } = useAuthDialog();
  const router = useRouter();
  const { data: session } = useSession();
  const [showJoinPremium, setShowJoinPremium] = useState(false);
  const [premiumStep, setPremiumStep] = useState<'intro' | 'subscribe'>('intro');
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

      router.push('/communities/create');
      return;
    }

    openSignInWithCallback(() => {
      setPendingCreateAfterLogin(true);
    });
  };

  useEffect(() => {
    if (!pendingCreateAfterLogin || !session?.user) return;

    if (hasSubscribed) {
      router.push('/communities/create');
    } else {
      setShowJoinPremium(true);
    }

    setPendingCreateAfterLogin(false);
  }, [pendingCreateAfterLogin, session?.user, hasSubscribed, router]);

  return (
    <div className="flex items-center">
      {hasSubscribed ? (
        <Link
          href="/communities/create"
          className="mr-2 hidden flex-shrink-0 gap-1.5 rounded-full px-6 text-gray-900 md:inline-flex"
        >
          <IconComponent iconName="PlusSignIcon" size={16} className="text-gray-900" />
          Create
        </Link>
      ) : (
        <Button
          variant="lime"
          className="mr-2 hidden flex-shrink-0 gap-1.5 rounded-full px-6 text-gray-900 md:inline-flex"
          onClick={handleCreateExperience}
        >
          <IconComponent iconName="PlusSignIcon" size={16} className="text-gray-900" />
          Create
        </Button>
      )}
      {session?.user ? (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent pr-0">
                <div className="relative aspect-square h-7 w-7">
                  <TukaiImage
                    src={session?.user?.image || ''}
                    alt={session?.user?.name || ''}
                    className="h-7 w-7 rounded-full"
                    quality={100}
                    fill
                    style={{ objectFit: 'cover' }}
                    showNotFoundText={false}
                  />
                  <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-[1px] border-white bg-red-600" />
                </div>
                <NavigationMenuContent className="w-54 z-50 rounded-lg p-2">
                  <div className="flex w-40 flex-col gap-2">
                    {/* <NavigationMenuLink className="cursor-pointer text-sm text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <IconComponent iconName="UserIcon" size={15} color="gray" />
                        My Profile
                      </div>
                    </NavigationMenuLink>

                    <NavigationMenuLink className="cursor-pointer text-sm text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <IconComponent iconName="Bookmark02Icon" size={15} color="gray" />
                        Wishlist
                      </div>
                    </NavigationMenuLink>

                    <NavigationMenuLink className="cursor-pointer text-sm text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <IconComponent iconName="BubbleChatIcon" size={15} color="gray" />
                        Messages
                      </div>
                    </NavigationMenuLink>

                    <NavigationMenuLink className="cursor-pointer text-sm text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <IconComponent iconName="Notification03Icon" size={15} color="gray" />
                        Notifications
                      </div>
                    </NavigationMenuLink>
                    <Separator />
                    <NavigationMenuLink className="cursor-pointer text-sm text-gray-600">
                      <div className="inline-flex items-center gap-2">
                        <IconComponent iconName="DirectionRight01Icon" size={15} color="gray" />
                        Tour Guide Account
                      </div>
                    </NavigationMenuLink> */}
                    <NavigationMenuLink onClick={handleLogout} className="cursor-pointer">
                      <div className="inline-flex items-center gap-2">
                        <IconComponent iconName="Logout04Icon" size={15} color="gray" />
                        <span className="font-satoshi text-sm text-gray-600">Logout</span>
                      </div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ) : (
        <Link href="/auth/sign-in" className="inline-flex">
          <Button className="h-[38px] rounded-[68px]">Sign In/Sign Up</Button>
        </Link>
      )}

      <Dialog
        open={showJoinPremium}
        onOpenChange={(open) => {
          setShowJoinPremium(open);
          // Always reopen on the intro step
          if (!open) setPremiumStep('intro');
        }}
      >
        <DialogContent className="w-[calc(100%-35px)] max-w-[620px] border-0 bg-transparent p-0 shadow-none">
          {premiumStep === 'intro' ? (
            <JoinTukaiPremium onUpgrade={() => setPremiumStep('subscribe')} />
          ) : (
            <div className="mx-auto max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 md:p-5">
              <SubscribeView />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
