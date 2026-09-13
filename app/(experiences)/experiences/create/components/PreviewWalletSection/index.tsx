'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Wallet } from '@/types/payment';

interface PreviewWalletSectionProps {
  wallet?: Wallet;
  onEdit?: () => void;
}

export const PreviewWalletSection = ({ wallet, onEdit }: PreviewWalletSectionProps) => {
  return (
    <div className="space-y-3 rounded-lg border-[1px] border-gray-100 bg-gray-50 px-3 py-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Wallet Details</h3>
          <p className="mt-1 text-xs italic text-gray-500">
            *You&apos;re the only one who can see this
          </p>
        </div>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      {!wallet ? (
        <div className="rounded-lg border-[1px] border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
          No wallet details added yet.
        </div>
      ) : (
        <div className="rounded-lg border-[1px] border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
          {wallet.walletType === 'bank' ? (
            <>
              <div className="inline-flex items-center gap-3 rounded-xl py-2 text-xs transition-colors">
                <span className="font-medium">Bank Account</span>
              </div>
              {wallet.accountHolderName ? (
                <p className="font-normal">{wallet.accountHolderName}</p>
              ) : null}
              {wallet.bankName ? (
                <p className="mt-0.5 text-gray-600">
                  {wallet.bankName}
                  {wallet.bankBranch ? `, ${wallet.bankBranch}` : ''}
                </p>
              ) : null}
              {wallet.accountNumber ? (
                <p className="mt-0.5 text-gray-600">
                  {'**** **** **** ' + wallet.accountNumber.slice(-4)}
                </p>
              ) : null}
              {wallet.country ? <p className="mt-0.5 text-gray-600">{wallet.country}</p> : null}
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-3 rounded-xl py-2 text-xs transition-colors">
                <img src="/images/mpesa.png" alt="M-Pesa" className="h-5 w-auto" />
                <span>M-Pesa</span>
              </div>
              <p className="text-xs text-gray-800">
                <span className="font-medium">MPesa Number:</span>{' '}
                <span className="font-normal">{wallet?.phone}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
