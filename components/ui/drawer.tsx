'use client';

import { Ref, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion } from 'framer-motion';

/**
 * The panel the canvas opens everything in.
 *
 * Two shapes, one component, as the canvas defines them: below 720px it is a
 * sheet rising from the bottom edge; from 720px it is a panel sliding in from
 * the right. Geometry, radii and shadows are the canvas's own values.
 *
 * `mobile="full"` keeps the right-hand panel on a phone and gives it the whole
 * screen instead. That is for a drawer deep enough to be a screen in its own
 * right - the place drawer runs to half a dozen sections - where a sheet at
 * 92% of the viewport spends its height on the page behind it.
 *
 * It renders through a portal. Without one, `position: fixed` resolves against
 * the nearest transformed or backdrop-filtered ancestor rather than the
 * viewport - which is why the bucket-list picker would not open on a large
 * screen and had to be moved onto a dialog.
 */
export type DrawerWidth = 'narrow' | 'medium' | 'wide';

// The canvas offers three, and sizes the panel to min(width, 100vw)
const WIDTHS: Record<DrawerWidth, number> = { narrow: 560, medium: 640, wide: 760 };

// Where the canvas's sheet stops, clearing the bottom navigation
const NAV_CLEARANCE = '69px';

export const Drawer = ({
  isOpen,
  setIsOpen,
  children,
  width = 'medium',
  mobile = 'sheet',
  panelRef,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  width?: DrawerWidth;
  /** What it becomes below 720px. See the note above. */
  mobile?: 'sheet' | 'full';
  /**
   * The panel itself, for content that has to know what it scrolls inside -
   * anchor tabs tracking their sections, say. The panel is the scroll
   * container, so the window fires no scroll event for it.
   */
  panelRef?: Ref<HTMLDivElement>;
}) => {
  const [mounted, setMounted] = useState(false);
  // Below this the panel is a bottom sheet. 720px is the canvas's own
  // threshold, and is not a Tailwind breakpoint.
  const [isSheet, setIsSheet] = useState(false);

  useEffect(() => {
    setMounted(true);

    const media = window.matchMedia('(max-width: 719px)');
    const update = () => setIsSheet(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Escape closes, and the page behind does not scroll while it is open
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false);
    const { overflow } = document.body.style;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, setIsOpen]);

  if (!mounted) return null;

  // Edge to edge, still arriving from the right: a drawer that is a screen in
  // its own right has nothing useful to show of the page behind it
  const isFullScreen = isSheet && mobile === 'full';

  const panel = isFullScreen
    ? {
        initial: { x: '104%' },
        animate: { x: 0 },
        exit: { x: '104%' },
        className: 'inset-0',
        style: { width: '100vw' },
      }
    : isSheet
      ? {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          className: 'inset-x-0 w-full rounded-t-18',
          style: {
            bottom: `calc(${NAV_CLEARANCE} + env(safe-area-inset-bottom))`,
            height: `calc(92dvh - ${NAV_CLEARANCE} - env(safe-area-inset-bottom))`,
            boxShadow: '0 -12px 40px rgba(1,51,52,.18)',
          },
        }
      : {
          initial: { x: '104%' },
          animate: { x: 0 },
          exit: { x: '104%' },
          className: 'inset-y-0 right-0',
          style: {
            // The canvas writes this as min(Npx, 100vw); these two are the same
            // CSS and work in browsers that do not support min()
            width: `${WIDTHS[width]}px`,
            maxWidth: '100vw',
            boxShadow: '-18px 0 48px rgba(1,51,52,.16)',
          },
        };

  return createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={panel.initial}
            animate={panel.animate}
            exit={panel.exit}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className={`absolute overflow-y-auto bg-white ${panel.className}`}
            style={{ ...panel.style, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
