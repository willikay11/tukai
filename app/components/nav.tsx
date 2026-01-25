'use client';
import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Calendar04Icon, Search01Icon, UserMultipleIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';

const links = [
  {
    name: 'Experiences',
    href: '/',
    icon: <Calendar04Icon size={18} variant="twotone" />,
  },
  { name: 'Explore', href: '/places', icon: <Search01Icon size={18} variant="twotone" /> },
  {
    name: 'Communities',
    href: '/communities',
    icon: <UserMultipleIcon size={18} variant="twotone" />,
  },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkItems = (showIcon: boolean) =>
    links.map((link) => (
      <Link
        href={link.href}
        key={link.name}
        className={clsx('mr-4 inline-flex h-fit items-center', {
          'text-primary md:border-b-[1px] md:border-primary md:pb-4': pathname === link.href,
        })}
        onClick={() => setOpen(false)}
      >
        <div className="inline-flex items-center">
          {showIcon && link.icon}
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
  return <div className="hidden md:inline-flex md:h-full">{linkItems(true)}</div>;
}
