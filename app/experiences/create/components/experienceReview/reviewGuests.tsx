'use client';

import { IconComponent } from '@/app/components/iconComponent';
import { GuestPill } from '@/components/ui/guest-pill';
import { User } from '@/types/user';

export interface ReviewGuestsProps {
  guests?: User[];
  maxDisplay?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export default function ReviewGuests({
  guests,
  maxDisplay = 6,
  editable = false,
  onEdit,
}: ReviewGuestsProps) {
  if (!guests || guests.length === 0) {
    return null;
  }

  const displayGuests = guests.slice(0, maxDisplay);
  const remainingCount = guests.length - displayGuests.length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-700">Guests ({guests.length})</h3>
        <div className="flex items-center gap-2">
          {guests.length > maxDisplay && (
            <button type="button" className="flex items-center gap-1 text-xs text-gray-500">
              See All <span className="text-gray-400">▼</span>
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            disabled={editable === false}
            className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Edit Guests"
          >
            <IconComponent iconName="Edit02Icon" size={16} className="text-primary" />
          </button>
        </div>
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
