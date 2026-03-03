'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.displayName?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
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
          <div key={guest.id} className="flex flex-col items-center gap-1">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={guest.picture} alt={guest.displayName || guest.firstName} />
              <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                {getInitials(guest)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[60px] truncate text-[10px] text-gray-600">
              {guest.displayName || guest.firstName}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              +{remainingCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
