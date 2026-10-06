'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { DESTINATIONS } from '@/app/shared/components/Navigation/destinations';
import { CityPicker } from '@/app/shared/components/Search/CityPicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, SOCIAL_LINKS } from '@/config/contacts';
import { useLocation } from '@/context/LocationContext';

const APP_STORE_URL = 'https://apps.apple.com/us/app/tukai/id6751051486';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tukaitravels.app&hl=en';

// Discover is left out here. The footer lists the other destinations only
const FOOTER_DESTINATIONS = DESTINATIONS.filter((destination) => destination.href !== '/');

const HEADING = 'text-sm font-semibold text-gray-700';
const LINK = 'text-gray-800 transition-colors hover:text-primary';

export const Footer = () => {
  const { city, isUsingLocation } = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationLabel = isUsingLocation ? 'Near me' : city;

  // On mobile the floating bottom navigation sits over the bottom of the page,
  // so the footer keeps its last line clear of it (24px offset + ~48px pill)
  return (
    <footer className="border-t border-gray-100 bg-gray-50 pb-24 pt-8 md:pb-6 md:pt-10">
      <div className="mx-4 md:mx-auto md:max-w-[1312px]">
        {/* Top: logo, location, contacts, company */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.svg"
                alt="Tukai logo"
                width={100}
                height={40}
                className="h-10 w-[100px] shrink-0"
              />
            </Link>
          </div>

          {/* Only the reader's own selected city. Without one, nothing is named */}
          {city && (
            <div>
              <h3 className={HEADING}>Location</h3>
              <p className="mt-3 flex items-center gap-2 text-sm text-gray-800">
                <IconComponent iconName="Location01Icon" size={18} color="currentColor" />
                {city}
              </p>
            </div>
          )}

          <div>
            <h3 className={HEADING}>Contacts</h3>
            <ul className="mt-3 flex flex-col gap-4 text-sm">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={`flex items-center gap-2 ${LINK}`}>
                  <IconComponent iconName="Mail01Icon" size={18} color="currentColor" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={CONTACT_PHONE_HREF} className={`flex items-center gap-2 ${LINK}`}>
                  <IconComponent iconName="Call02Icon" size={18} color="currentColor" />
                  {CONTACT_PHONE}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={HEADING}>Company</h3>
            <ul className="mt-3 flex flex-col gap-4 text-sm">
              <li>
                <Link href="/about" className={LINK}>
                  About us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={LINK}>
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle: app download and social links */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-10 md:grid-cols-4">
          <div className="col-span-2">
            <h3 className={HEADING}>Get the app</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <StoreBadge
                href={APP_STORE_URL}
                icon="AppleIcon"
                small="Download on the"
                name="App Store"
              />
              <StoreBadge
                href={PLAY_STORE_URL}
                icon="PlayStoreIcon"
                small="Get it on"
                name="Google Play"
              />
            </div>
          </div>

          {SOCIAL_LINKS.length > 0 && (
            <div className="col-span-2 md:col-span-1 md:col-start-4">
              <h3 className={HEADING}>Follow us</h3>
              <ul className="mt-3 flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:text-primary"
                    >
                      <IconComponent iconName={social.icon} size={20} color="currentColor" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Destinations, for a second route to each. Help sits under You */}
        {/* <nav aria-label="Footer" className="mt-8 md:mt-10">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-4 text-center text-sm text-gray-800 md:grid-cols-4 md:text-left">
            {FOOTER_DESTINATIONS.map((destination) => (
              <li key={destination.href}>
                <Link href={destination.href} className="hover:text-primary">
                  {destination.label}
                </Link>
                {destination.showsFace && (
                  <ul className="mt-2">
                    <li>
                      <Link href="/help" className="text-gray-600 hover:text-primary">
                        Help
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav> */}

        {/* Bottom: legal line, and the reader's location */}
        <div className="mt-8 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 md:mt-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <p>© {moment().year()} Tukai, Inc. All rights reserved.</p>
            <Link href="/terms" className="hover:text-primary">
              Terms of use
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy policy
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 md:justify-end">
            <IconComponent iconName="Location01Icon" size={16} color="currentColor" />
            {locationLabel && <span className="text-gray-800">{locationLabel}</span>}
            {locationLabel && <span aria-hidden="true">·</span>}
            <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <PopoverTrigger className="font-semibold text-primary hover:underline">
                Update location
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={12}
                className="w-auto rounded-[18px] border-line-soft p-0"
              >
                <CityPicker onClose={() => setIsLocationOpen(false)} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </footer>
  );
};

const StoreBadge = ({
  href,
  icon,
  small,
  name,
}: {
  href: string;
  icon: string;
  small: string;
  name: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 rounded-full border border-gray-200 bg-white py-2 pl-2 pr-5 transition-colors hover:bg-gray-100"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-800">
      <IconComponent iconName={icon} size={18} color="currentColor" />
    </span>
    <span className="flex flex-col leading-tight">
      <span className="text-[11px] text-gray-500">{small}</span>
      <span className="text-sm font-semibold text-gray-900">{name}</span>
    </span>
  </a>
);
