import Image from 'next/image';
import Link from 'next/link';

import { Facebook01Icon, InstagramIcon, NewTwitterIcon, YoutubeIcon } from '@hugeicons/react-pro';

import IconComponent from '../iconComponent';

export default function Footer() {
  return (
    <footer className="grid grid-cols-12 border-t border-gray-100 bg-gray-50 pb-6 pt-10">
      <div className="col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
        {/* Top Section */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2">
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="Tukai logo"
                width={100}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <div className="col-span-2">
            <h3 className="text-base font-semibold text-gray-700">Location:</h3>
            <p className="mt-1 text-sm text-gray-800">Parkwood Villas, Syokimau</p>
          </div>

          <div className="col-span-4">
            <h3 className="text-base font-semibold text-gray-700">Contacts:</h3>
            <div className="mt-1 flex flex-row items-center gap-3 text-sm text-gray-800">
              <a href="mailto:support@tukai.co" className="hover:text-primary">
                support@tukai.co
              </a>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <a href="tel:+254716909815" className="hover:text-primary">
                +254 716 909 815
              </a>
            </div>
          </div>

          <div className="col-span-4">
            <div className="flex h-full items-end justify-end gap-6">
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
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 md:flex-row">
          <p>© 2026 Tukai, Inc. All Rights Reserved</p>
          <div className="flex gap-6">
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
}
