'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import moment from 'moment';

import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';

import { IconComponent } from '@/app/shared/components/Icons';

export const Footer = () => {
  return (
    <footer className="grid grid-cols-12 border-t border-gray-100 bg-gray-50 pb-6 pt-8 md:pt-10">
      <div className="col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
        {/* Top Section */}
        <div className="grid grid-cols-12 gap-4 md:gap-2">
          <div className="col-span-12 flex justify-center md:col-span-2 md:justify-start">
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="Tukai logo"
                width={100}
                height={40}
                className="mt-2 h-10 w-[100px] shrink-0"
              />
            </Link>
          </div>
          <div className="col-span-12 text-center md:col-span-2 md:text-left">
            <h3 className="text-sm font-semibold text-gray-700 md:text-base">Location:</h3>
            <p className="mt-1 text-sm text-gray-800">Parkwood Villas, Syokimau</p>
          </div>

          <div className="col-span-12 text-center md:col-span-4 md:text-left">
            <h3 className="text-sm font-semibold text-gray-700 md:text-base">Contacts:</h3>
            <div className="mt-1 flex flex-col items-center gap-2 text-sm text-gray-800 md:flex-row md:items-center md:gap-3">
              <a href="mailto:support@tukai.co" className="hover:text-primary">
                support@tukai.co
              </a>
              <div className="hidden h-1 w-1 rounded-full bg-gray-300 md:block" />
              <a href="tel:+254716909815" className="hover:text-primary">
                +254 716 909 815
              </a>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="flex h-full items-start justify-center gap-6 md:items-end md:justify-end">
              <a
                href="https://instagram.com/tukai_app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary"
                aria-label="Instagram"
              >
                <IconComponent iconName="InstagramIcon" size={20} />
              </a>
              <a
                href="https://x.com/Tukaiexper69436"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary"
                aria-label="Twitter"
              >
                <IconComponent iconName="NewTwitterIcon" size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@tukaiexperiences"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary"
                aria-label="TikTok"
              >
                <IconComponent iconName="TiktokIcon" size={20} />
              </a>
              {/* <a
                href="https://facebook.com/tukai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-primary"
                aria-label="Facebook"
              >
                <IconComponent iconName="Facebook02Icon" size={20} />
              </a> */}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 flex flex-col items-center justify-start gap-4 border-t border-gray-200 pt-4 text-sm text-gray-600 md:mt-8 md:flex-row md:pt-6">
          <p>© {moment().year()} Tukai, Inc. All Rights Reserved</p>
          <div className="flex flex-col items-center gap-4 md:ml-2.5 md:flex-row md:gap-6">
            <Link href="/terms" className="hover:text-primary">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
