'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PayoutMethodDrawer } from '@/app/shared/components/Payouts';
import { ReservationPayoutAccount } from '@/types/placeReservation';

type PayoutWallet = ReservationPayoutAccount['wallets'][number];

const hostName = (host: ReservationPayoutAccount['host']): string =>
  host?.displayName || [host?.firstName, host?.lastName].filter(Boolean).join(' ') || 'the host';

/** "M-Pesa", "KCB Bank" - the method a wallet pays out through. */
export const walletMethod = (wallet: PayoutWallet): { label: string; icon: string } =>
  wallet.walletType === 'phone'
    ? { label: 'M-Pesa', icon: 'SmartPhone01Icon' }
    : wallet.walletType === 'paybill'
      ? { label: 'Paybill', icon: 'Wallet02Icon' }
      : { label: wallet.bankName || 'Bank account', icon: 'BankIcon' };

/** "•••6826, Weekend Readers" or "KCB Bank, account •••1234". */
export const walletAccountLine = (wallet: PayoutWallet): string => {
  const destination = wallet.destination || 'Number missing';
  if (wallet.walletType === 'bank') return `${wallet.bankName || 'Bank'}, account ${destination}`;
  return [destination, wallet.accountHolderName].filter(Boolean).join(', ');
};

export const WalletLines = ({ wallets }: { wallets: PayoutWallet[] }) => (
  <div className="flex flex-col gap-3">
    {wallets.map((wallet) => {
      const method = walletMethod(wallet);

      return (
        <div key={wallet.id} className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-base font-semibold text-brand-ink">
            <IconComponent
              iconName={method.icon}
              size={18}
              color="currentColor"
              className="flex-shrink-0 text-brand"
            />
            {method.label}
          </span>
          <span className="text-sm text-gray-800">{walletAccountLine(wallet)}</span>
          {wallet.isVerified === false && (
            <span className="text-sm text-warn">Not verified yet. Payouts start once it is.</span>
          )}
        </div>
      );
    })}
  </div>
);

/**
 * The Wallet details step. Booking income goes to the payout wallet of the
 * host who earns it (DEV-450), not to a wallet of the place's own, so this
 * shows that account and lets the host - only the host - set it up or change
 * it through their usual payout settings.
 */
export const ReservationWallet = ({
  placeTitle,
  payoutAccount,
  isLoading,
  onChanged,
}: {
  placeTitle: string;
  payoutAccount?: ReservationPayoutAccount | null;
  isLoading: boolean;
  onChanged: () => void;
}) => {
  const { data: session } = useSession();
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);

  const wallets = payoutAccount?.wallets ?? [];
  const host = payoutAccount?.host ?? null;
  const isHost = Boolean(host && session?.user?.id && host.id === session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[19px] font-bold tracking-[-0.2px] text-gray-800">
          {wallets.length > 0 ? 'Your wallet' : 'Set up your wallet'}
        </h3>
        <p className="mt-1.5 text-sm leading-normal text-ink-muted">
          Money from reservations at {placeTitle} is sent here.
        </p>
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-surface" aria-label="Loading wallet" />
      ) : wallets.length > 0 ? (
        <div className="rounded-xl bg-surface px-4 py-3.5">
          <WalletLines wallets={wallets} />
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-xl bg-warn-surface px-3.5 py-3 text-[13.5px] leading-[1.45] text-warn">
          <IconComponent
            iconName="InformationCircleIcon"
            size={16}
            color="currentColor"
            className="mt-0.5 flex-shrink-0"
          />
          {isHost
            ? 'No payout method yet. Add one so guests can pay.'
            : `${hostName(host)} has no payout method yet. Guests can pay once they add one.`}
        </p>
      )}

      {isHost ? (
        <button
          type="button"
          onClick={() => setIsPayoutOpen(true)}
          className="inline-flex h-12 items-center gap-2 self-start rounded-full border-[1.5px] border-brand px-[22px] text-[15px] font-semibold text-brand hover:bg-surface-brand"
        >
          <IconComponent iconName="Wallet02Icon" size={19} color="currentColor" />
          {wallets.length > 0 ? 'Change payout method' : 'Set up payout method'}
        </button>
      ) : (
        !isLoading && (
          <p className="text-[13.5px] leading-[1.45] text-ink-muted">
            Payouts go to {hostName(host)}, who hosts this place. Only they can change where the
            money goes.
          </p>
        )
      )}

      <PayoutMethodDrawer
        isOpen={isPayoutOpen}
        onClose={() => {
          setIsPayoutOpen(false);
          onChanged();
        }}
      />
    </div>
  );
};
