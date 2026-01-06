'use client';
import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Calendar04Icon, Menu02Icon, Search01Icon } from '@hugeicons/react-pro';
import clsx from 'clsx';

import { Dialog, DialogContent } from '@/components/ui/dialog';

const links = [
  {
    name: 'Experiences',
    href: '/',
    icon: <Calendar04Icon size={18} variant="twotone" />,
  },
  { name: 'Explore', href: '/places', icon: <Search01Icon size={18} variant="twotone" /> },
  // {
  //   name: 'Communities',
  //   href: '/communities',
  //   icon: <UserMultipleIcon size={18} variant="twotone" />,
  // },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkItems = (showIcon: boolean) =>
    links.map((link) => (
      <Link
        href={link.href}
        key={link.name}
        className={clsx('mr-4 inline-flex h-full items-center', {
          'text-primary md:border-b-[1px] md:border-primary': pathname === link.href,
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
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="px-6">
          <div className="flex h-full flex-col">
            <nav className="flex flex-col space-y-2">{linkItems(false)}</nav>
          </div>
        </DialogContent>
      </Dialog>
      <div className="inline-flex cursor-pointer items-center justify-center md:hidden">
        <Menu02Icon size={24} variant="twotone" type="rounded" onClick={() => setOpen(true)} />
        <Link href="/" className='ml-2.5 inline-flex items-center'>
          <Image
            src="/images/logo.svg"
            alt="Tukai logo"
            width={20}
            height={20}
          />
          <span className='ml-2 font-bold text-lg text-[#013334]'>Tukai</span>
        </Link>
      </div>
      <div className="hidden md:inline-flex md:h-full">{linkItems(true)}</div>
    </>
  );
}
