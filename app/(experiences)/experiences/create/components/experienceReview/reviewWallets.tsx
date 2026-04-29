'use client';

import { IconComponent } from '@/app/components/iconComponent';
import { ReviewWalletsSkeleton } from '@/app/components/skeletons';
import { useGetWallets } from '@/hooks/payment';
import { Wallet } from '@/types/payment';

interface ReviewWalletsProps {
  editable?: boolean;
  onEdit?: () => void;
}

const maskAccountNumber = (value?: string) => {
  if (!value) return 'N/A';
  const visible = value.slice(-4);
  return `**** **** **** ${visible}`;
};

export const ReviewWallets = ({ editable = false, onEdit }: ReviewWalletsProps) => {
  const { data: walletsResponse, isLoading } = useGetWallets();
  const wallets: Wallet[] = walletsResponse?.data?.results ?? [];
  const activeWallets = wallets.filter((wallet) => wallet.isActive);

  if (isLoading) {
    return <ReviewWalletsSkeleton />;
  }

  if (activeWallets.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-[12px] border border-gray-200 bg-gray-100 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-700">Wallet Details</h3>
        <button
          type="button"
          onClick={onEdit}
          disabled={!editable}
          className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Edit Wallet Details"
        >
          <IconComponent iconName="Edit02Icon" size={16} className="text-primary" />
        </button>
      </div>
      <p className="mt-2 text-xs italic text-gray-700">*You're the only one who can see this</p>

      <div className="mt-4 space-y-3">
        {activeWallets.map((wallet) => (
          <div key={wallet.id} className="rounded-[12px] border border-gray-200 bg-white p-4">
            {wallet.walletType === 'phone' ? (
              <>
                <div className="flex items-center gap-2">
                  <img src="/images/mpesa.png" alt="M-Pesa" className="h-5 w-auto" />
                  <span className="text-base text-xs font-medium text-gray-700">M-Pesa</span>
                </div>
                <p className="mt-4 text-xs font-semibold text-gray-800">
                  Phone Number: <span className="font-normal">{wallet.phone || 'N/A'}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800">
                  {wallet.bankName || 'Bank Account'}
                </p>
                {wallet.accountHolderName ? (
                  <p className="mt-2 text-xs text-gray-700">{wallet.accountHolderName}</p>
                ) : null}
                <p className="mt-2 text-xs text-gray-700">
                  Account Number: {maskAccountNumber(wallet.accountNumber)}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
