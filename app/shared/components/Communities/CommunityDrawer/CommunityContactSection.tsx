'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { CommunityContact } from '@/types/community';

import { Divider, SectionHeading } from './parts';

/** How long the copy button says "copied" before going back. */
const COPIED_FOR_MS = 2000;

const withoutSpaces = (value: string) => value.replace(/\s+/g, '');

const ContactItem = ({
  icon,
  label,
  value,
  href,
  onCopy,
  isCopied,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
  onCopy?: () => void;
  isCopied?: boolean;
}) => (
  <div className="flex min-w-0 items-start gap-4">
    <IconComponent
      iconName={icon}
      size={22}
      color="currentColor"
      className="mt-px flex-shrink-0 text-gray-800"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
      <span className="text-[15px] font-semibold text-gray-800">{label}</span>
      <div className="-my-3 flex items-center gap-1">
        <a
          href={href}
          className="inline-flex min-h-11 min-w-0 items-center truncate text-[14.5px] text-ink-muted hover:text-brand hover:underline"
        >
          {value}
        </a>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            title="Copy"
            aria-label={isCopied ? 'Phone number copied' : 'Copy phone number'}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-brand transition-colors hover:bg-surface-brand"
          >
            <IconComponent
              iconName={isCopied ? 'Tick02Icon' : 'Copy01Icon'}
              size={18}
              color="currentColor"
            />
          </button>
        )}
      </div>
    </div>
  </div>
);

/**
 * Phone and email, from the community's contact record. Hidden when it has
 * neither - Create community does not collect them yet (the handoff's Open
 * item 7), and an empty block would read as missing data.
 */
export const CommunityContactSection = ({ contact }: { contact?: CommunityContact }) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), COPIED_FOR_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const phone = contact?.contactPhone?.trim();
  const email = contact?.contactEmail?.trim();
  if (!phone && !email) return null;

  const copyPhone = async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(withoutSpaces(phone));
      setIsCopied(true);
      toast({ description: 'Phone number copied.' });
    } catch {
      toast({ description: 'Could not copy the phone number.', variant: 'destructive' });
    }
  };

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-6 gap-y-5">
        {phone && (
          <ContactItem
            icon="Call02Icon"
            label="Phone number"
            value={phone}
            href={`tel:${withoutSpaces(phone)}`}
            onCopy={copyPhone}
            isCopied={isCopied}
          />
        )}
        {email && (
          <ContactItem icon="AtIcon" label="Email" value={email} href={`mailto:${email}`} />
        )}
      </div>
      {/* Polite, so the "copied" swap on the button is heard as well as seen */}
      <span aria-live="polite" className="sr-only">
        {isCopied ? 'Phone number copied' : ''}
      </span>
      <Divider />
    </>
  );
};

type Social = {
  key: keyof CommunityContact;
  label: string;
  icon: string;
  className: string;
  href: (value: string) => string;
};

/**
 * In the handoff's order. Facebook is in the design but not on the API's
 * contact record, so it is left out until there is a field for it.
 */
const SOCIALS: Social[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: 'WhatsappIcon',
    className: 'bg-social-whatsapp-surface text-social-whatsapp',
    href: (value) =>
      value.startsWith('http') ? value : `https://wa.me/${value.replace(/[^\d]/g, '')}`,
  },
  {
    key: 'websiteUrl',
    label: 'Website',
    icon: 'Globe02Icon',
    className: 'bg-social-website-surface text-social-website',
    href: (value) => value,
  },
  {
    key: 'instagramUrl',
    label: 'Instagram',
    icon: 'InstagramIcon',
    className: 'bg-social-instagram-surface text-social-instagram',
    href: (value) => value,
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    icon: 'TiktokIcon',
    className: 'bg-social-tiktok-surface text-social-tiktok',
    href: (value) => value,
  },
  {
    key: 'youtubeUrl',
    label: 'YouTube',
    icon: 'YoutubeIcon',
    className: 'bg-social-youtube-surface text-social-youtube',
    href: (value) => value,
  },
  {
    key: 'xUrl',
    label: 'X',
    icon: 'NewTwitterIcon',
    className: 'bg-social-x-surface text-social-x',
    href: (value) => value,
  },
];

/** Only the socials the community has, each opening in a new tab. */
export const CommunitySocials = ({ contact }: { contact?: CommunityContact }) => {
  const present = SOCIALS.filter((social) => {
    const value = contact?.[social.key];
    return typeof value === 'string' && value.trim().length > 0;
  });

  if (present.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-3.5">
        <SectionHeading title="Socials" />
        <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 scrollbar-hide">
          {present.map((social) => (
            <a
              key={social.key}
              href={social.href(String(contact?.[social.key]).trim())}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-11 flex-none items-center gap-2 whitespace-nowrap rounded-full pl-3.5 pr-[18px] text-[14.5px] font-medium hover:brightness-[0.96] ${social.className}`}
            >
              <IconComponent iconName={social.icon} size={19} color="currentColor" />
              {social.label}
            </a>
          ))}
        </div>
      </div>
      <Divider />
    </>
  );
};
