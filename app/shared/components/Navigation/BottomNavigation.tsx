'use client';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MapsGlobal02TwotoneRounded } from '@hugeicons-pro/core-twotone-rounded';
import { Bookmark01Icon, Calendar04Icon, Search01Icon, UserIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';

import { IconComponent } from '@/app/shared/components/Icons';

const links = [
  {
    name: 'Experiences',
    href: '/experiences',
    icon: <Calendar04Icon size={20} variant="stroke" />,
  },
  {
    name: 'Explore',
    href: '/places',
    icon: <Search01Icon size={24} variant="stroke" />,
  },
  {
    name: 'Communities',
    href: '/communities',
    icon: <IconComponent iconName="MapsGlobal02TwotoneRounded" size={20} />,
  },
  // {
  //   name: 'Profile',
  //   href: '/auth/profile',
  //   icon: <UserIcon size={24} variant="stroke" />,
  // },
  // {
  //   name: 'Saved',
  //   href: '/saved',
  //   icon: <Bookmark01Icon size={24} variant="stroke" />,
  // },
];

export const BottomNavigation = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const linkItems = () =>
    links.map((link) => {
      const isActiveLink = isActive(link.href);
      return (
        <Link
          href={link.href}
          key={link.name}
          className={clsx('inline-flex items-center justify-center transition-all', {
            'rounded-full bg-[#D4F1E8] px-4 py-3 text-primary': isActiveLink,
            'text-gray-600': !isActiveLink,
          })}
        >
          <div className={clsx('flex items-center justify-center gap-2')}>
            <span>{link.icon}</span>
            {isActiveLink && <span className="text-sm font-medium">{link.name}</span>}
          </div>
        </Link>
      );
    });
  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between gap-4 rounded-full bg-white px-4 py-3 shadow-lg transition-transform duration-300 ease-in-out md:hidden',
        {
          'translate-y-0': isVisible,
          'translate-y-[150%]': !isVisible,
        },
      )}
    >
      {linkItems()}
    </div>
  );
};
