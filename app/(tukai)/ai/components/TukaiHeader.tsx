'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useTukai } from '@/context/TukaiContext';

/**
 * The bar over the chat: Back (paywall and pay) or New chat, History, and the
 * open chat's title in the middle, hidden on phones and in an empty chat.
 */
export const TukaiHeader = ({ isEmptyChat }: { isEmptyChat: boolean }) => {
  const { view, backFromPaywall, newChat, currentChat, isHistoryOpen, setHistoryOpen } = useTukai();
  const hasBack = view === 'paywall' || view === 'pay';

  return (
    <div className="relative grid min-h-11 flex-shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 px-5 py-3 min-[720px]:px-6 min-[1100px]:px-0">
      <div className="flex min-w-0 items-center gap-2">
        {hasBack && (
          <button
            type="button"
            onClick={backFromPaywall}
            aria-label="Back"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-gray-800 hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
        )}
        {view === 'chat' && (
          <button
            type="button"
            onClick={newChat}
            className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-lime pl-3.5 pr-[18px] text-[14.5px] font-semibold text-brand-ink hover:brightness-[.97] active:scale-[.98]"
          >
            <IconComponent iconName="Edit04Icon" size={19} color="currentColor" />
            New chat
          </button>
        )}
        <button
          type="button"
          onClick={() => setHistoryOpen(!isHistoryOpen)}
          aria-expanded={isHistoryOpen}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-surface pl-3.5 pr-[18px] text-[14.5px] font-semibold text-brand-ink hover:bg-surface-brand"
        >
          <IconComponent
            iconName="TimeQuarterPassIcon"
            size={19}
            color="currentColor"
            className="text-brand"
          />
          History
        </button>
      </div>
      <span className="hidden min-w-0 max-w-[440px] truncate text-center text-[15px] font-semibold text-gray-800 min-[720px]:block">
        {view === 'chat' && !isEmptyChat ? currentChat?.title : ''}
      </span>
      <div />
    </div>
  );
};
