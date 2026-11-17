'use client';

import { Ref, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { PHONE_QUERY } from '@/app/shared/hooks/useIsPhone';

/**
 * The panel the canvas opens everything in.
 *
 * Two shapes, one component, as the mobile handoff defines them: below 720px
 * it is a sheet rising from the bottom edge, sitting on the bottom tab bar
 * with a handle at the top; from 720px it is a panel sliding in from the
 * right. Geometry, radii, shadows and motion are the handoff's own values.
 *
 * `mobile="full"` keeps the right-hand panel on a phone and gives it the whole
 * screen instead. That is for a drawer deep enough to be a screen in its own
 * right - the place drawer runs to half a dozen sections - where a sheet at
 * 92% of the viewport spends its height on the page behind it.
 *
 * The frame does not scroll; its body does, below the handle, and that body
 * is what `panelRef` points at. `overscroll-behavior: contain` keeps a scroll
 * that reaches the end of the sheet from moving the page behind it.
 *
 * There is no scrim and tapping outside does nothing, as in the canvas - the
 * page behind stays usable (handoff open item 5).
 *
 * It renders through a portal. Without one, `position: fixed` resolves against
 * the nearest transformed or backdrop-filtered ancestor rather than the
 * viewport - which is why the bucket-list picker would not open on a large
 * screen and had to be moved onto a dialog.
 */
export type DrawerWidth = 'narrow' | 'medium' | 'wide';

// The canvas offers three, and sizes the panel to min(width, 100vw)
const WIDTHS: Record<DrawerWidth, number> = { narrow: 560, medium: 640, wide: 760 };

// Where the sheet stops: on top of the bottom tab bar, which is 69px plus the
// home-indicator inset
const NAV_CLEARANCE = '69px';

// 1s each way: a soft landing opening, a quicker start closing
const OPEN_EASE = [0.22, 0.8, 0.24, 1] as const;
const CLOSE_EASE = [0.45, 0, 0.2, 1] as const;

export const Drawer = ({
  isOpen,
  setIsOpen,
  children,
  width = 'medium',
  mobile = 'sheet',
  panelRef,
  ariaLabel,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  width?: DrawerWidth;
  /** What it becomes below 720px. See the note above. */
  mobile?: 'sheet' | 'full';
  /**
   * The panel's scrolling body, for content that has to know what it scrolls
   * inside - anchor tabs tracking their sections, say. The window fires no
   * scroll event for it.
   */
  panelRef?: Ref<HTMLDivElement>;
  ariaLabel?: string;
}) => {
  const [mounted, setMounted] = useState(false);
  // Below 720px the panel is a bottom sheet. Read in script only for the
  // motion's axis; the panel only exists once mounted, so it never paints in
  // the wrong shape.
  const [isSheet, setIsSheet] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);

    const media = window.matchMedia(PHONE_QUERY);
    const update = () => setIsSheet(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false);

    document.addEventListener('keydown', onKey);

    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  if (!mounted) return null;

  // Edge to edge, still arriving from the right: a drawer that is a screen in
  // its own right has nothing useful to show of the page behind it
  const isFullScreen = isSheet && mobile === 'full';
  const isBottomSheet = isSheet && !isFullScreen;

  const panel = isFullScreen
    ? {
        hidden: { x: '104%' },
        shown: { x: '0%' },
        className: 'inset-0',
        style: { width: '100vw' },
      }
    : isBottomSheet
      ? {
          // Far enough past the bottom edge that the shadow goes too
          hidden: { y: 'calc(100% + 96px)' },
          // The same shape as `hidden`, so the two interpolate
          shown: { y: 'calc(0% + 0px)' },
          className: 'inset-x-0 w-full rounded-t-18',
          style: {
            bottom: `calc(${NAV_CLEARANCE} + env(safe-area-inset-bottom))`,
            height: `calc(92dvh - ${NAV_CLEARANCE} - env(safe-area-inset-bottom))`,
            boxShadow: '0 -12px 40px rgba(1,51,52,.18)',
          },
        }
      : {
          hidden: { x: '104%' },
          shown: { x: '0%' },
          className: 'inset-y-0 right-0',
          style: {
            // The canvas writes this as min(Npx, 100vw); these two are the same
            // CSS and work in browsers that do not support min()
            width: `${WIDTHS[width]}px`,
            maxWidth: '100vw',
            boxShadow: '-6px 0 24px rgba(1,51,52,.08)',
          },
        };

  const duration = reduceMotion ? 0 : 1;

  return createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        // z-48: under the bottom tab bar (49), which stays visible and usable
        // beneath a sheet, and under the dialogs and popovers (50) a panel
        // opens over itself. A full-screen panel covers the tab bar instead -
        // its own action bar sits along the bottom edge - and takes z-50,
        // where the dialogs it opens still land over it, later in the DOM.
        <div className={`pointer-events-none fixed inset-0 ${isFullScreen ? 'z-50' : 'z-[48]'}`}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={panel.hidden}
            animate={{ ...panel.shown, transition: { duration, ease: OPEN_EASE } }}
            exit={{ ...panel.hidden, transition: { duration, ease: CLOSE_EASE } }}
            className={`pointer-events-auto absolute flex flex-col overflow-hidden bg-white ${panel.className}`}
            style={panel.style}
          >
            {isBottomSheet && (
              // Drawn as the canvas draws it. It cannot be dragged yet
              // (handoff open item 5)
              <div
                aria-hidden="true"
                className="mx-auto mt-2 h-[5px] w-10 flex-shrink-0 rounded-full bg-line"
              />
            )}
            <div
              ref={panelRef}
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
              style={
                {
                  WebkitOverflowScrolling: 'touch',
                  // What a pinned action bar inside pads its foot with. A sheet
                  // ends on the tab bar, which already carries the home
                  // indicator's inset, so the bar adds none of its own there
                  // (handoff open item 6); a panel reaching the bottom edge does.
                  '--drawer-inset-bottom': isBottomSheet ? '0px' : 'env(safe-area-inset-bottom)',
                } as React.CSSProperties
              }
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
