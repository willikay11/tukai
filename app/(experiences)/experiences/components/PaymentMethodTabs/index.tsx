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
        className={`
          flex items-center justify-center gap-2
          px-4 py-2.5 rounded-full text-sm font-medium
          border transition-colors
          ${
            value === 'mpesa'
              ? 'border-primary text-primary bg-white'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }
        `}
      >
        <IconComponent iconName="Smartphone01Icon" size={16} />
        M-Pesa
      </button>
      <button
        onClick={() => onChange('card')}
        className={`
          flex items-center justify-center gap-2
          px-4 py-2.5 rounded-full text-sm font-medium
          border transition-colors
          ${
            value === 'card'
              ? 'border-primary text-primary bg-white'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }
        `}
      >
        <IconComponent iconName="CreditCardIcon" size={16} />
        Credit Card
      </button>
    </div>
  );
};
