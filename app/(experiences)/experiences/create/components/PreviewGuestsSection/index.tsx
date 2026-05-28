'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { InvitedMember } from '@/components/ui/invite-members';
import { Experience } from '@/types/experience';

interface PreviewGuestsSectionProps {
  guests: Experience['guests'];
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
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>

      {guests.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {visibleGuests.map((guest) => (
            <div key={guest.id} className="flex items-center gap-2 rounded-[40px] bg-gray-50 p-2">
              <div className="relative h-8 w-8 flex-shrink-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700"
                    title={guest.email}
                  >
                    {getInitials(guest.email.split('@')[0])}
                  </div>
              </div>
              <span className="w-24 truncate text-xs text-gray-500">{guest.email}</span>
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
