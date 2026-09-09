'use client';

import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

/**
 * Whether the experience charges.
 *
 * Only paid experiences can be created today, so free is shown locked rather
 * than hidden: a host looking for it can see it is coming instead of wondering
 * whether they missed it. There is nothing to store while there is nothing to
 * choose — the picker takes a value once free opens up.
 */
const PRICING_OPTIONS = [
  { value: 'paid', label: 'Paid Experience' },
  { value: 'free', label: 'Free Experience', disabled: true, icon: 'LockIcon' },
];

export const PricingModelPicker = () => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-800">Is this a free or paid experience</label>
    <div className="w-fit">
      <PillRadioGroup options={PRICING_OPTIONS} value="paid" onChange={() => undefined} />
    </div>
  </div>
);
