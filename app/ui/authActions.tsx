'use client';

import Link from 'next/link';
import { ArrowDown01Icon, UserAdd01Icon } from '@hugeicons/react-pro';
import { useContext } from 'react';
import { SessionContext } from '@/providers/SessionProvider';
import { Menu, MenuButton, MenuItems } from '@headlessui/react';

export default function AuthActions() {
  const session: any = useContext(SessionContext);

  return (
    <div className="flex items-center">
      <Link href="">
        <span className="text-xs text-gray-800">Become A Tour Guide</span>
      </Link>
      <div className="mx-2 h-[10px] w-[1px] bg-secondary" />
      {session.user !== undefined ? (
        <Menu>
          <MenuButton>
            <div className="flex items-center">
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
              <ArrowDown01Icon variant="twotone" size={16} />
            </div>
          </MenuButton>
          <MenuItems
            transition
            anchor="bottom end"
            className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10">
              Logout
            </button>
          </MenuItems>
        </Menu>
      ) : (
        <Link href="/auth/sign-in" className="inline-flex">
          <UserAdd01Icon size={15} className="mr-2 text-gray-700" />
          <span className="text-xs text-gray-800">Sign In/Sign Up</span>
        </Link>
      )}
    </div>
  );
}
