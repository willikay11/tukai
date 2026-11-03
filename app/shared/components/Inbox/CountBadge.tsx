import { unreadBadge } from '@/types/notification';

/**
 * The lime count on the account menu's Notifications and Messages rows and on
 * the inbox tabs. Nothing at all at zero.
 */
export const CountBadge = ({ count }: { count: number }) => {
  const label = unreadBadge(count);
  if (!label) return null;

  return (
    <span className="inline-flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-brand-ink">
      {label}
    </span>
  );
};
