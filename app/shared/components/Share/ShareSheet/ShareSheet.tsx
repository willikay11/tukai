'use client';

import { useEffect, useRef, useState } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { IconComponent } from '@/app/shared/components/Icons';
import { toast } from '@/app/shared/hooks/useToast';
import { TukaiImage } from '@/components/ui/image';
import { canvasIcon } from '@/utils/canvas-icons';

import type { ShareContent } from '../shareContent';

/** WhatsApp, Email and More share one shape and differ in colour. */
const DESTINATION =
  'inline-flex h-12 min-w-[120px] flex-[1_1_0] items-center justify-center gap-2 whitespace-nowrap rounded-full pl-3.5 pr-[18px] text-[14.5px] font-semibold no-underline transition-[filter,transform] hover:brightness-[.96] active:scale-[.98]';

/**
 * The one share sheet: places, experiences, itineraries, communities and
 * moments. A preview of what is going out, the link with Copy link, then
 * WhatsApp, Email and the device's own menu, and a note saying who the link
 * works for - so nobody forwards a private thing believing it lets people in.
 *
 * It opens over whatever is showing, the drawer included, which stays where
 * it was. Sharing never books, pays for or joins anything.
 */
export const ShareSheet = ({
  content,
  open,
  onOpenChange,
}: {
  content: ShareContent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [canUseDeviceSheet, setCanUseDeviceSheet] = useState(false);
  const copyRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  // Read after mount: the server has no navigator, and rendering More from a
  // guess would flip it on hydration
  useEffect(() => setCanUseDeviceSheet(typeof navigator?.share === 'function'), []);

  // "Copied" lasts until the sheet next opens
  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  const urlShort = content.url.replace(/^https?:\/\//, '');
  const message = `${content.lead}: ${content.url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      setCopied(true);
      toast({ title: 'Link copied.', variant: 'success' });
    } catch {
      // A denied clipboard: hand over the link selected, ready to copy by hand
      linkRef.current?.focus();
      linkRef.current?.select();
    }
  };

  const handleDeviceShare = async () => {
    try {
      await navigator.share({ title: content.title, text: content.lead, url: content.url });
    } catch {
      // Dismissing the device's menu rejects; the sheet simply stays put
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <DialogPrimitive.Overlay className="absolute inset-0 bg-brand-ink/[.42]" />

          <DialogPrimitive.Content
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              copyRef.current?.focus();
            }}
            // Radix hears Escape in the capture phase; stopping it there keeps
            // the drawer underneath, which closes on any Escape, open
            onEscapeKeyDown={(event) => event.stopPropagation()}
            className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[480px] flex-col overflow-y-auto overscroll-contain rounded-[18px] bg-white shadow-[0_24px_60px_rgba(1,51,52,.24)] outline-none"
          >
            <DialogPrimitive.Title className="sr-only">{content.heading}</DialogPrimitive.Title>

            <div className="relative flex-none bg-surface-brand">
              <div className="relative aspect-[3/2] max-h-[46dvh] w-full">
                {content.image && (
                  <TukaiImage src={content.image} alt="" fill style={{ objectFit: 'cover' }} />
                )}
              </div>

              <span className="pointer-events-none absolute left-4 top-4 inline-flex h-8 max-w-[calc(100%-96px)] items-center gap-1.5 rounded-full bg-black/55 pl-2.5 pr-3 text-13 font-semibold text-white backdrop-blur-[6px]">
                <IconComponent
                  iconName={content.kindIcon}
                  size={16}
                  color="currentColor"
                  className="flex-none"
                />
                <span className="truncate">{content.kind}</span>
              </span>

              <DialogPrimitive.Close
                aria-label="Close"
                className="absolute right-2.5 top-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-[0_2px_10px_rgba(1,51,52,.2)] transition-colors hover:bg-surface"
              >
                <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
              </DialogPrimitive.Close>
            </div>

            <div className="flex flex-none flex-col gap-5 px-6 pb-6 pt-5">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="m-0 text-2xl font-bold leading-[1.2] tracking-[-0.4px] text-gray-800 [text-wrap:pretty]">
                  {content.title}
                </h2>
                {content.sub && (
                  <span className="text-[15px] leading-[1.4] text-ink-muted [text-wrap:pretty]">
                    {content.sub}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex h-14 items-center gap-2.5 rounded-full bg-surface pl-[18px] pr-1.5">
                  <IconComponent
                    iconName={canvasIcon('hgi-link-01')!}
                    size={19}
                    color="currentColor"
                    className="flex-none text-ink-muted"
                  />
                  {/* Read-only rather than plain text, so the link can be
                      selected by hand where the clipboard is refused */}
                  <input
                    ref={linkRef}
                    readOnly
                    value={urlShort}
                    aria-label="Link"
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-[15px] text-gray-800 outline-none"
                  />
                  <button
                    ref={copyRef}
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex h-11 flex-none items-center gap-[7px] whitespace-nowrap rounded-full pl-3.5 pr-[18px] text-[14.5px] font-semibold transition-transform active:scale-[.97] ${
                      copied
                        ? 'bg-surface-brand text-brand'
                        : 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                    }`}
                  >
                    <IconComponent
                      iconName={canvasIcon(copied ? 'hgi-tick-02' : 'hgi-copy-01')!}
                      size={18}
                      color="currentColor"
                      className="flex-none"
                    />
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <span className="sr-only" aria-live="polite">
                    {copied ? 'Link copied' : ''}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp, opens in a new tab"
                    className={`${DESTINATION} bg-social-whatsapp-surface text-social-whatsapp`}
                  >
                    <IconComponent
                      iconName="WhatsappIcon"
                      size={19}
                      color="currentColor"
                      className="flex-none"
                    />
                    WhatsApp
                  </a>

                  <a
                    href={`mailto:?subject=${encodeURIComponent(content.lead)}&body=${encodeURIComponent(message)}`}
                    className={`${DESTINATION} bg-surface-brand text-brand`}
                  >
                    <IconComponent
                      iconName="Mail01Icon"
                      size={19}
                      color="currentColor"
                      className="flex-none"
                    />
                    Email
                  </a>

                  {canUseDeviceSheet && (
                    <button
                      type="button"
                      onClick={handleDeviceShare}
                      className={`${DESTINATION} bg-surface text-gray-800`}
                    >
                      <IconComponent
                        iconName="MoreHorizontalIcon"
                        size={19}
                        color="currentColor"
                        className="flex-none"
                      />
                      More
                    </button>
                  )}
                </div>
              </div>

              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-note [text-wrap:pretty]">
                <IconComponent
                  iconName={canvasIcon(content.isPrivate ? 'hgi-square-lock-02' : 'hgi-view')!}
                  size={18}
                  color="currentColor"
                  className="mt-px flex-none text-brand"
                />
                <span>{content.note}</span>
              </p>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
