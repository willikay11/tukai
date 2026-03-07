'use client';

import { GuestPill } from '@/components/ui/guest-pill';
import { User } from '@/types/user';

export interface ReviewGuestsProps {
  guests?: User[];
  maxDisplay?: number;
}

export default function ReviewGuests({ guests, maxDisplay = 6 }: ReviewGuestsProps) {
  if (!guests || guests.length === 0) {
    return null;
  }

  const displayGuests = guests.slice(0, maxDisplay);
  const remainingCount = guests.length - displayGuests.length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700">
          Guests ({guests.length})
        </h3>
        {guests.length > maxDisplay && (
          <button type="button" className="flex items-center gap-1 text-xs text-gray-500">
            See All <span className="text-gray-400">▼</span>
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {displayGuests.map((guest) => (
          <GuestPill
            key={guest.id}
            name={guest.displayName || guest.firstName}
            image={guest.picture}
          />
        ))}
        {remainingCount > 0 && (
          <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-600">
              +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}
