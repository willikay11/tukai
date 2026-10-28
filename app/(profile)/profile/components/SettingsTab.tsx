'use client';

import { useState } from 'react';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useGetWallets } from '@/app/(experiences)/hooks/usePayment';
import { useNotificationPreferences } from '@/app/(profile)/hooks';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { NotificationPreferences } from '@/types/notification';
import { Wallet } from '@/types/payment';

import { MyProfile, profileHandle, profileName } from '../profile';
import { NotificationsDrawer } from './NotificationsDrawer';

const payoutMethodLine = (wallets: Wallet[]): string => {
  const active = wallets.find((wallet) => wallet.isActive) ?? wallets[0];
  if (!active) return 'Add how you get paid out';

  if (active.walletType === 'phone' && active.phone) {
    return `M-Pesa ending ${active.phone.slice(-3)}`;
  }

  return active.bankName || 'Bank account';
};

const personalDetailsLine = (profile?: MyProfile | null): string => {
  const name = profileName(profile);
  const handle = profileHandle(profile);
  return [name, handle].filter(Boolean).join(', ');
};

/** Real field count is 7, not the handoff's sample 6 - email has no "social" toggle, push has no "marketing" one. */
const notificationsLine = (prefs?: NotificationPreferences): string => {
  if (!prefs) return 'Push, email and in-app alerts';

  const keys = [
    'marketing',
    'communities',
    'experiences',
    'pushCommunity',
    'pushExperiences',
    'pushSocial',
    'pushGuides',
  ] as const;
  const on = keys.filter((key) => prefs[key]).length;
  return `${on} of ${keys.length} on`;
};

const SettingsRow = ({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: string;
  title: string;
  sub: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-16 items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface active:scale-[0.99]"
  >
    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-brand">
      <IconComponent iconName={icon} size={21} color="currentColor" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[15px] font-semibold text-gray-900">{title}</span>
      <span className="text-[13.5px] text-ink-muted">{sub}</span>
    </span>
    <IconComponent iconName="ArrowRight01Icon" size={18} color="currentColor" className="text-ink-subtle" />
  </button>
);

export const SettingsTab = ({
  profile,
  onEditProfile,
}: {
  profile?: MyProfile | null;
  onEditProfile: () => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data } = useGetWallets();
  const walletsPayload = data?.data;
  const wallets: Wallet[] = Array.isArray(walletsPayload) ? walletsPayload : walletsPayload?.results ?? [];

  const { data: notifResponse } = useNotificationPreferences();
  const notifPrefs = notifResponse?.success ? notifResponse.data : undefined;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const comingSoon = (what: string) =>
    toast({ description: `${what} is coming soon.` });

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">Settings</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">Your account, payouts and who can see what.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(max(220px,(100%_-_32px)/3),1fr))] gap-x-4 gap-y-1">
        <SettingsRow
          icon="UserCircleIcon"
          title="Personal details"
          sub={personalDetailsLine(profile)}
          onClick={onEditProfile}
        />
        <SettingsRow
          icon="Wallet02Icon"
          title="Payout method"
          sub={payoutMethodLine(wallets)}
          onClick={() => comingSoon('Payout settings')}
        />
        <SettingsRow
          icon="Notification03Icon"
          title="Notifications"
          sub={notificationsLine(notifPrefs)}
          onClick={() => setIsNotificationsOpen(true)}
        />
        <SettingsRow
          icon="LockIcon"
          title="Privacy"
          sub="Profile visible to everyone on Tukai"
          onClick={() => comingSoon('Privacy settings')}
        />
        <SettingsRow
          icon="HelpCircleIcon"
          title="Help and support"
          sub="Guides, contact and safety"
          onClick={() => comingSoon('Help and support')}
        />
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut({ redirect: false });
          router.push('/');
        }}
        className="-mt-1.5 inline-flex h-11 items-center gap-2.5 self-start whitespace-nowrap rounded-full px-3 text-[15px] font-semibold text-danger hover:bg-danger-surface"
      >
        <IconComponent iconName="Logout03Icon" size={20} color="currentColor" />
        Sign out
      </button>

      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};
