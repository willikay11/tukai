'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';
import type { TukaiPin } from '@/utils/tukai';

import { TukaiMapFrame } from './TukaiMapFrame';

/**
 * The map as a sheet rising over the bottom of the chat. It stays mounted
 * while closed, so the map does not reload every time it opens.
 */
export const TukaiMapSheet = ({
  isOpen,
  title,
  meta,
  pins,
  route,
  selectedId,
  onClose,
  onPin,
  onOpenPin,
}: {
  isOpen: boolean;
  title: string;
  meta: string;
  pins: TukaiPin[];
  route: boolean;
  selectedId: string | null;
  onClose: () => void;
  onPin: (id: string) => void;
  onOpenPin: (id: string) => void;
}) => (
  <div
    role="region"
    aria-label="Map"
    aria-hidden={!isOpen}
    data-ai-sheet={isOpen ? 'open' : 'closed'}
    className={cn(
      'absolute inset-x-0 bottom-0 z-[6] flex h-[min(62%,600px)] flex-col overflow-hidden rounded-t-18 bg-white shadow-[0_-14px_40px_rgba(1,51,52,.16)]',
      isOpen
        ? 'visible translate-y-0 transition-transform [transition-duration:420ms] [transition-timing-function:cubic-bezier(.2,.8,.2,1)]'
        : 'invisible translate-y-[calc(100%+48px)] transition-[transform,visibility] duration-300 ease-in-out',
    )}
  >
    <div className="flex flex-shrink-0 flex-col pb-2.5 pl-5 pr-3 pt-2">
      <span aria-hidden="true" className="mb-1.5 h-1 w-10 self-center rounded-full bg-line" />
      <div className="flex min-h-11 items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-base font-bold leading-[1.3] text-gray-800">{title}</span>
          <span className="text-[13px] leading-[1.4] text-ink-muted">{meta}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface pl-3 pr-4 text-[14.5px] font-semibold text-gray-800 hover:bg-surface-brand"
        >
          <IconComponent iconName="ArrowDown01Icon" size={18} color="currentColor" />
          Hide map
        </button>
      </div>
    </div>
    <div className="relative min-h-0 flex-1 bg-surface-brand">
      <TukaiMapFrame
        pins={pins}
        route={route}
        selectedId={selectedId}
        onPin={onPin}
        onOpen={onOpenPin}
      />
    </div>
  </div>
);
