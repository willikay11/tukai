'use client';

import Image from 'next/image';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';

type JoinTukaiPremiumProps = {
  onClose?: () => void;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
  price?: string;
};

const premiumFeatures = [
  {
    title: 'Create Unlimited Experiences',
    description:
      'Planning a free or payable hiking, biking, camping or any other type of experience? Create it and invite others',
    iconName: 'PlusSignCircleIcon',
    iconColor: '#2563EB',
  },
  {
    title: 'Track & Manage Ticket Sales',
    description:
      'See how many tickets have been sold, add more tickets as you wish and even message your guests for easy planning',
    iconName: 'Notification03Icon',
    iconColor: '#E11D48',
  },
  {
    title: 'Get Paid',
    description:
      '12 hours after the experience, receive the payment in your created and preferred account/wallet',
    iconName: 'Money03Icon',
    iconColor: '#059669',
  },
  {
    title: 'AI Capability',
    description: 'Use our TuKAI to help you create your experience in seconds',
    iconName: 'BubbleChatIcon',
    iconColor: '#7C3AED',
  },
];

export default function JoinTukaiPremium({
  onClose,
  onUpgrade,
  isUpgrading = false,
  price = 'KES 130.00/month',
}: JoinTukaiPremiumProps) {
  return (
    <div className="w-full max-w-[560px] rounded-xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black text-gray-700">Join Tukai Premium</p>
          <p className="mt-1 text-xs text-gray-700">
            Please subscribe to <span className="font-semibold">Tukai Premium</span> to create and
            host an experiences
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Close"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        )}
      </div>

      <div className="relative mb-3 overflow-hidden rounded-xl bg-[#B0E800] p-4 pr-28 md:p-5 md:pr-32">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-black text-[#013334]">{price}</p>
          <span className="inline-flex h-[25px] items-center rounded-[40px] bg-primary px-3 py-1 text-xs font-semibold text-[#B0E800] text-white">
            <IconComponent iconName="GiftIcon" size={12} color="#B0E800" className="mr-1" />
            Special Offer
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-[#013334]">
          Create unlimited experiences!! Earn money!!
        </p>

        <div className="absolute bottom-0 right-0 h-24 w-24 md:h-28 md:w-28">
          <Image
            src="/images/medium-shot-smiley-man-holding-baggage 1.svg"
            alt="Premium plan"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 md:p-5">
        <p className="mb-3 text-base font-black text-gray-700">Top Premium Features</p>

        <div className="space-y-3">
          {premiumFeatures.map((feature) => (
            <div key={feature.title} className="flex items-start gap-2.5">
              <div className="mt-0.5">
                <IconComponent iconName={feature.iconName} size={18} color={feature.iconColor} />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700">{feature.title}</p>
                <p className="mt-0.5 text-xs text-gray-700">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="gradient"
        className="h-[55px] w-full rounded-[40px]"
        onClick={onUpgrade}
        disabled={isUpgrading}
      >
        {isUpgrading ? (
          'Processing...'
        ) : (
          <span>
            Upgrade to Premium <span className="text-white/50">({price})</span>
          </span>
        )}
      </Button>

      <p className="mt-3 text-center text-xs italic text-gray-500">
        *Payments are handled externally via Paystack
      </p>
    </div>
  );
}
