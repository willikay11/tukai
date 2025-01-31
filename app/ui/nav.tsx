'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { Menu02Icon, Search01Icon, Calendar04Icon, UserMultipleIcon } from '@hugeicons/react-pro';

const links = [
  { name: 'Explore', href: '/', icon: <Search01Icon size={18} variant="twotone" /> },
  {
    name: 'Experiences',
    href: '/experiences',
    icon: <Calendar04Icon size={18} variant="twotone" />,
  },
  { name: 'Community', href: '/community', icon: <UserMultipleIcon size={18} variant="twotone" /> },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden">
        <Menu02Icon size={20} variant="twotone" type="rounded" />
      </div>
      <div className="hidden md:inline-flex md:h-full">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.name}
            className={clsx('mr-4 inline-flex h-full items-center', {
              'border-b-[1px] border-primary text-primary': link.href.includes(pathname),
            })}
          >
            <div className="inline-flex items-center">
              {link.icon}
              <span
                className={clsx('ml-1 text-xs', {
                  'text-gray-800': pathname !== link.href,
                  'font-semibold text-primary': link.href.includes(pathname),
                })}
              >
                {link.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
