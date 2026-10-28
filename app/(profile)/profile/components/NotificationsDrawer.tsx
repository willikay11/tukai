'use client';

import { useEffect, useState } from 'react';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/app/(profile)/hooks';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { NotificationPreferences } from '@/types/notification';

type Key = keyof Omit<NotificationPreferences, 'id' | 'email'>;

const EMAIL_ROWS: { key: Key; title: string; sub: string }[] = [
  { key: 'marketing', title: 'Marketing emails', sub: 'New features and what is on in your city' },
  { key: 'communities', title: 'Community emails', sub: 'Activity in communities you run or follow' },
  { key: 'experiences', title: 'Experience emails', sub: 'Bookings, reminders and ticket sales' },
];

const PUSH_ROWS: { key: Key; title: string; sub: string }[] = [
  { key: 'pushCommunity', title: 'Community activity', sub: 'Invites and updates from communities' },
  { key: 'pushExperiences', title: 'Experience activity', sub: 'Reminders and ticket sales' },
  { key: 'pushSocial', title: 'Social activity', sub: 'Likes and comments on your moments' },
  { key: 'pushGuides', title: 'Guide activity', sub: 'Messages and updates from guides' },
];

const SwitchRow = ({
  title,
  sub,
  on,
  onClick,
}: {
  title: string;
  sub: string;
  on: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onClick}
    className="-mx-3 flex min-h-16 items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface"
  >
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[15px] font-semibold text-gray-900">{title}</span>
      <span className="text-[13.5px] leading-[1.4] text-ink-muted">{sub}</span>
    </span>
    <span
      aria-hidden="true"
      className={cn(
        'relative h-[30px] w-[52px] flex-shrink-0 rounded-full transition-colors',
        on ? 'bg-brand' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(1,51,52,0.3)] transition-[left]',
          on ? 'left-[25px]' : 'left-[3px]',
        )}
      />
    </span>
  </button>
);

export const NotificationsDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const { data: response, isLoading } = useNotificationPreferences(isOpen);
  const saved = response?.success ? response.data : undefined;

  const { mutate: save, isPending } = useUpdateNotificationPreferences();
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (isOpen && saved) setDraft(saved);
  }, [isOpen, saved]);

  const close = () => {
    setDraft(null);
    onClose();
  };

  const toggle = (key: Key) => setDraft((current) => (current ? { ...current, [key]: !current[key] } : current));

  const changed = Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved));
  const hasChannel = draft
    ? draft.pushCommunity || draft.pushExperiences || draft.pushSocial || draft.pushGuides || draft.marketing || draft.communities || draft.experiences
    : true;
  const ready = changed && hasChannel;

  const submit = () => {
    if (!ready || !draft) return;

    save(
      {
        id: draft.id,
        changes: {
          marketing: draft.marketing,
          communities: draft.communities,
          experiences: draft.experiences,
          pushCommunity: draft.pushCommunity,
          pushExperiences: draft.pushExperiences,
          pushSocial: draft.pushSocial,
          pushGuides: draft.pushGuides,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Notification settings saved', variant: 'success' });
          close();
        },
        onError: (failure: Error) => toast({ title: 'Could not save', description: failure.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="Notifications">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            Notifications
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-5">
          {isLoading || !draft ? (
            <div className="h-40 animate-pulse rounded-xl bg-surface" />
          ) : (
            <>
              <div className="flex flex-col gap-2.5">
                <span className="text-[15px] font-semibold text-gray-900">Email</span>
                <div className="flex flex-col">
                  {EMAIL_ROWS.map((row) => (
                    <SwitchRow
                      key={row.key}
                      title={row.title}
                      sub={row.sub}
                      on={Boolean(draft[row.key])}
                      onClick={() => toggle(row.key)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-[15px] font-semibold text-gray-900">Push</span>
                <div className="flex flex-col">
                  {PUSH_ROWS.map((row) => (
                    <SwitchRow
                      key={row.key}
                      title={row.title}
                      sub={row.sub}
                      on={Boolean(draft[row.key])}
                      onClick={() => toggle(row.key)}
                    />
                  ))}
                </div>
              </div>

              <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-note">
                <IconComponent
                  iconName="InformationCircleIcon"
                  size={18}
                  color="currentColor"
                  className="mt-px flex-shrink-0 text-brand"
                />
                <span>Tickets, receipts and security alerts always reach you, whatever you turn off here.</span>
              </p>

              {changed && !hasChannel && (
                <p role="alert" className="text-[13.5px] leading-[1.45] text-danger">
                  Keep at least one way for Tukai to reach you.
                </p>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={close}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span aria-hidden="true" className="flex-1" />

          <button
            type="button"
            onClick={submit}
            disabled={!ready || isPending}
            aria-disabled={!ready}
            className="h-12 whitespace-nowrap rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink enabled:hover:bg-lime-dark disabled:bg-[#E4F4B5] disabled:text-[#5E7A45]"
          >
            Save changes
          </button>
        </div>
      </div>
    </Drawer>
  );
};
