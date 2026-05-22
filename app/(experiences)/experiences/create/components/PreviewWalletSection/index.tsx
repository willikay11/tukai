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
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Payment Method</h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
        {walletType ? getWalletLabel(walletType) : 'Not configured'}
      </div>
    </div>
  );
};
