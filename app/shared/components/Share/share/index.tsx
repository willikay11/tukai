'use client';

import { useEffect, useState } from 'react';

import {
  CopyLinkIcon,
  Facebook02Icon,
  Mail01Icon,
  Message01Icon,
  NewTwitterIcon,
  Share08Icon,
  TelegramIcon,
  Tick02Icon,
  WhatsappIcon,
} from '@hugeicons/react-pro';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { TukaiImage } from '@/components/ui/image';
import type { ShareKind } from '@/utils/share-metadata';

/**
 * Sharing, named for what is actually being shared.
 *
 * It used to say "Share Location" over an experience, a community and a bucket
 * list alike. The `kind` names the subject in the heading and in the message
 * that goes out with the link.
 *
 * Where the device has a share sheet of its own, that is offered first: it
 * reaches every app the reader has installed, which a fixed grid never can.
 * The grid stays for everything else.
 */
const DESTINATIONS = [
  {
    title: 'WhatsApp',
    icon: <WhatsappIcon size={18} variant="twotone" className="text-primary" />,
    href: ({ text }: ShareTarget) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    title: 'Telegram',
    icon: <TelegramIcon size={18} variant="twotone" className="text-primary" />,
    href: ({ link, message }: ShareTarget) =>
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
  },
  {
    title: 'X',
    icon: <NewTwitterIcon size={18} variant="twotone" className="text-primary" />,
    href: ({ link, message }: ShareTarget) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
  },
  {
    title: 'Facebook',
    icon: <Facebook02Icon size={18} variant="twotone" className="text-primary" />,
    href: ({ link }: ShareTarget) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
  },
  {
    title: 'Email',
    icon: <Mail01Icon size={18} variant="twotone" className="text-primary" />,
    href: ({ subject, text }: ShareTarget) =>
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
  },
  {
    title: 'Messages',
    icon: <Message01Icon size={18} variant="twotone" className="text-primary" />,
    href: ({ text }: ShareTarget) => `sms:?&body=${encodeURIComponent(text)}`,
  },
];

type ShareTarget = { link: string; subject: string; message: string; text: string };

export const Share = ({
  coverPhoto,
  title,
  link,
  kind = 'place',
}: {
  coverPhoto: string;
  title: string;
  link: string;
  /** What is being shared, so the sheet can say so */
  kind?: ShareKind;
}) => {
  const [open, setOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [canUseDeviceSheet, setCanUseDeviceSheet] = useState(false);

  // Read after mount: the server has no navigator, and rendering the button
  // from a guess would flip it on hydration
  useEffect(() => setCanUseDeviceSheet(typeof navigator !== 'undefined' && !!navigator.share), []);

  useEffect(() => {
    if (!hasCopied) return;

    const timer = setTimeout(() => setHasCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [hasCopied]);

  const subject = `${title} on Tukai`;
  const message = `Have a look at this ${kind} on Tukai: ${title}`;
  const target: ShareTarget = { link, subject, message, text: `${message}\n${link}` };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setHasCopied(true);
    } catch {
      // A denied clipboard is not worth an error dialog; the link is on screen
      // to select by hand
      setHasCopied(false);
    }
  };

  const handleDeviceShare = async () => {
    try {
      await navigator.share({ title: subject, text: message, url: link });
      setOpen(false);
    } catch {
      // Dismissing the OS sheet rejects; the dialog simply stays put
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full"
        variant="outline"
      >
        <span>Share</span>
        <Share08Icon size={16} variant="twotone" className="ml-2" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* `min-w-0` on the body: DialogContent lays its children out on a
            grid, where a track's min-width is auto, so the link below would
            push the whole row wider than the dialog rather than truncating */}
        <DialogContent className="max-w-[420px] gap-0 overflow-hidden rounded-2xl p-5 md:max-w-[420px]">
          <div className="flex min-w-0 flex-col">
            <DialogTitle className="pr-8 text-lg font-bold text-gray-900">
              Share this {kind}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Send {title} to someone, or copy its link
            </DialogDescription>

            {/* What they are about to send, as the recipient will see it */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
              {coverPhoto && (
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                  <TukaiImage src={coverPhoto} alt={title} fill style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
                <p className="truncate text-xs text-gray-400">{link}</p>
              </div>
            </div>

            {canUseDeviceSheet && (
              <Button
                variant="gradient"
                onClick={handleDeviceShare}
                className="mt-4 w-full rounded-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <Share08Icon size={16} variant="twotone" />
                  Share via…
                </span>
              </Button>
            )}

            <Button
              variant="primary-light"
              onClick={handleCopy}
              className="mt-2 w-full justify-between rounded-full"
            >
              {hasCopied ? 'Link copied' : 'Copy link'}
              {hasCopied ? (
                <Tick02Icon size={16} variant="twotone" className="text-primary" />
              ) : (
                <CopyLinkIcon size={16} variant="twotone" className="text-primary" />
              )}
            </Button>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {DESTINATIONS.map((destination) => (
                <a
                  key={destination.title}
                  href={destination.href(target)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl bg-gray-50 p-3 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {destination.icon}
                  <span className="w-full truncate">{destination.title}</span>
                </a>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
