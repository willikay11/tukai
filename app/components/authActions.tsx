'use client';

import Link from 'next/link';
import { ArrowDown01Icon, UserAdd01Icon } from '@hugeicons/react-pro';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { useRouter } from 'next/navigation';
import { deleteToken } from '@/lib/actions';
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image';
export default function AuthActions() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/');
  };

  return (
    <div className="flex items-center">
      <Link href="">
        <span className="text-xs text-gray-800">Become A Tour Guide</span>
      </Link>
      <div className="mx-2 h-[10px] w-[1px] bg-secondary" />
      {session?.user ? (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <div className="relative aspect-square h-7 w-7">
                  <Image
                    src={session?.user?.image || ''}
                    alt={session?.user?.name || ''}
                    className="h-7 w-7 rounded-full"
                    quality={100}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-[1px] border-white bg-red-600" />
                </div>
                <span className="ml-2 mr-2.5 text-xs text-gray-600">
                  {session?.user?.name}
                </span>
                <NavigationMenuContent className="p-2 rounded-lg w-20">
                  <NavigationMenuLink
                    onClick={handleLogout}
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Logout
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ) : (
        <Link href="/auth/sign-in" className="inline-flex">
          <UserAdd01Icon size={15} className="mr-2 text-gray-700" />
          <span className="text-xs text-gray-800">Sign In/Sign Up</span>
        </Link>
      )}
    </div>
  );
}
