'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { InvitedMember } from '@/components/ui/invite-members';

interface PreviewGuestsSectionProps {
  guests: InvitedMember[];
  onEdit?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const PreviewGuestsSection = ({ guests, onEdit }: PreviewGuestsSectionProps) => {
  const MAX_AVATARS = 8;
  const visibleGuests = guests.slice(0, MAX_AVATARS);
  const overflowCount = Math.max(0, guests.length - MAX_AVATARS);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Guests ({guests.length})</h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      {guests.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {visibleGuests.map((guest) => (
            <div key={guest.id} className="relative h-8 w-8 flex-shrink-0">
              {guest.avatarUrl ? (
                <img
                  src={guest.avatarUrl}
                  alt={guest.name}
                  className="h-8 w-8 rounded-full object-cover"
                  title={guest.name}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700"
                  title={guest.name}
                >
                  {getInitials(guest.name)}
                </div>
              )}
            </div>
          ))}
          {overflowCount > 0 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              +{overflowCount}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No guests invited yet</p>
      )}
    </div>
  );
};
