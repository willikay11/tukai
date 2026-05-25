'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewWalletSectionProps {
  walletType?: string;
  onEdit?: () => void;
}

export const PreviewWalletSection = ({ walletType, onEdit }: PreviewWalletSectionProps) => {
  const getWalletLabel = (type?: string): string => {
    switch (type) {
      case 'phone':
        return 'M-Pesa';
      case 'bank':
        return 'Bank Account';
      default:
        return 'Payment Method';
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 px-3 py-3 space-y-3 border-[1px] border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-900">Wallet Details</h3>
          <p className="mt-1 text-xs text-gray-500 italic">*You&apos;re the only one who can see this</p>
        </div>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      <div className="rounded-lg border-[1px] border-gray-200 px-3 py-2 bg-white text-xs text-gray-700">
        <div className="inline-flex items-center gap-3 rounded-xl py-2 text-xs transition-colors">
          <img src="/images/mpesa.png" alt="M-Pesa" className="h-5 w-auto" />
          <span>M-Pesa</span>
        </div>
        <p className='text-xs text-gray-800'><span className='font-medium'>MPesa Number:</span> <span className="font-normal">0712345678</span></p>
      </div>
    </div>
  );
};
