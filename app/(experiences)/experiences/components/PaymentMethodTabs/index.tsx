import { IconComponent } from '@/app/shared/components/Icons';

interface PaymentMethodTabsProps {
  value: 'mpesa' | 'card';
  onChange: (method: 'mpesa' | 'card') => void;
}

export const PaymentMethodTabs = ({ value, onChange }: PaymentMethodTabsProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onChange('mpesa')}
        className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
          value === 'mpesa'
            ? 'border-primary bg-white text-primary'
            : 'border-gray-200 text-gray-700 hover:border-gray-300'
        } `}
      >
        <IconComponent iconName="Smartphone01Icon" size={16} />
        M-Pesa
      </button>
      <button
        onClick={() => onChange('card')}
        className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
          value === 'card'
            ? 'border-primary bg-white text-primary'
            : 'border-gray-200 text-gray-700 hover:border-gray-300'
        } `}
      >
        <IconComponent iconName="CreditCardIcon" size={16} />
        Credit Card
      </button>
    </div>
  );
};
