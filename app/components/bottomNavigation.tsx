'use client';
import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Calendar04Icon, Search01Icon } from '@hugeicons/react-pro';
import clsx from 'clsx';
import { link } from 'fs';

const links = [
  {
    name: 'Experiences',
    href: '/',
    icon: <Calendar04Icon size={20} variant="twotone" className="mb-1" />,
  },
  {
    name: 'Explore',
    href: '/places',
    icon: <Search01Icon size={20} variant="twotone" className="mb-1" />,
  },
  // {
  //   name: 'Communities',
  //   href: '/communities',
  //   icon: <UserMultipleIcon size={18} variant="twotone" />,
  // },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const linkItems = () =>
    links.map((link) => (
      <Link
        href={link.href}
        key={link.name}
        className={clsx('mr-4 inline-flex h-full items-center', {
          'text-primary md:border-b-[1px] md:border-primary': pathname === link.href,
        })}
      >
        <div className={clsx('flex flex-col justify-center flex items-center')}>
          {link.icon}
          <span
            className={clsx('ml-1 text-xs', {
              'text-gray-800': pathname !== link.href,
              'font-semibold text-primary': pathname === link.href,
            })}
          >
            {link.name}
          </span>
        </div>
      </Link>
    ));
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white py-4 px-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] md:hidden">
      {linkItems().map((item, index) => (
        <div key={index} className="inline-flex w-1/2 justify-center">
          {item}
        </div>
      ))}
    </div>
  );
}
