'use client';

import Link from 'next/link';
import { ArrowDown01Icon, UserAdd01Icon } from '@hugeicons/react-pro';
import { useContext } from 'react';
import { SessionContext } from '@/providers/SessionProvider';
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
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
export default function AuthActions() {
  const session: any = useContext(SessionContext);
  const router = useRouter();

  const handleLogout = async () => {
    await deleteToken();
    router.push('/');
  };

  return (
    <div className="flex items-center">
      <Link href="">
        <span className="text-xs text-gray-800">Become A Tour Guide</span>
      </Link>
      <div className="mx-2 h-[10px] w-[1px] bg-secondary" />
      {session.user !== undefined ? (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
                  <span className="text-xs text-white">
                    {session.user?.firstName?.charAt(0).toUpperCase()}
                    {session.user?.lastName?.charAt(0).toUpperCase()}
                  </span>
                  <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-[1px] border-white bg-red-600" />
                </div>
                <span className="ml-2 mr-2.5 text-xs text-gray-600">
                  {session.user?.firstName} {session.user.lastName}
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
