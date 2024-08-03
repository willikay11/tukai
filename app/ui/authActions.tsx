'use client';

import Link from 'next/link';
import { ArrowDown01Icon, UserAdd01Icon } from '@hugeicons/react-pro';
import { useContext } from 'react';
import { SessionContext } from '@/providers/SessionProvider';

export default function AuthActions() {
  const { user }: { firstName: string; lastName: string } = useContext(SessionContext);

  return (
    <div className="flex items-center">
      <Link href="">
        <span className="text-xs text-gray-800">Become A Tour Guide</span>
      </Link>
      <div className="mx-2 h-[10px] w-[1px] bg-secondary" />
      <Link href="/auth/sign-in" className="inline-flex">
        {user !== undefined ? (
          <div className="flex items-center">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-600">
              <span className="text-xs text-white">
                {user?.firstName?.charAt(0).toUpperCase()}
                {user?.lastName?.charAt(0).toUpperCase()}
              </span>
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-[1px] border-white bg-red-600" />
            </div>
            <span className="ml-2 mr-2.5 text-xs text-gray-600">
              {user?.firstName} {user.lastName}
            </span>
            <ArrowDown01Icon variant="twotone" size={16} />
          </div>
        ) : (
          <>
            <UserAdd01Icon size={15} className="mr-2 text-gray-700" />
            <span className="text-xs text-gray-800">Sign In/Sign Up</span>
          </>
        )}
      </Link>
    </div>
  );
}
