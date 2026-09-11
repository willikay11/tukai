'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { GuestPill } from '@/components/ui/guest-pill';
import { Input } from '@/components/ui/input';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';

interface InvitedGuestsTabProps {
  experienceId: string;
  guests: Experience['guests'];
}

type GuestsView = 'guests' | 'communities';

// Guests come back as an email and a status — no display name, no avatar — so
// the chip label is derived from the address
const guestLabel = (email: string): string => email?.split('@')[0] ?? 'Guest';

export const InvitedGuestsTab = ({ experienceId, guests }: InvitedGuestsTabProps) => {
  const router = useRouter();
  const [view, setView] = useState<GuestsView>('guests');
  const [search, setSearch] = useState('');

  const visibleGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return guests;
    return guests.filter((guest) => guest.email?.toLowerCase().includes(query));
  }, [guests, search]);

  const views: Array<{ id: GuestsView; label: string; count: number }> = [
    { id: 'guests', label: 'Guests', count: guests.length },
    // The API does not return invited communities on the experience, only
    // accepts them on write — so this view has nothing to read yet
    { id: 'communities', label: 'Communities', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {views.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                view === option.id
                  ? 'bg-lime/20 text-primary'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {view === 'guests' && (
          <div className="w-full sm:w-64">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guests"
              aria-label="Search guests"
              className="rounded-full"
              icon={
                <IconComponent
                  iconName="Search01Icon"
                  size={16}
                  color="currentColor"
                  className="text-gray-400"
                />
              }
            />
          </div>
        )}
      </div>

      {view === 'guests' ? (
        visibleGuests.length === 0 ? (
          <div className="py-10">
            <NoData message="No guests invited yet" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleGuests.map((guest) => (
              // No remove-guest endpoint exists, so the chip has no remove action
              <GuestPill key={guest.id} name={guestLabel(guest.email)} />
            ))}
          </div>
        )
      ) : (
        <div className="py-10">
          <NoData message="Invited communities are not available yet" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <Button
          type="button"
          variant="gradient"
          onClick={() =>
            router.push(`/experiences/create?experienceId=${experienceId}&step=guests`)
          }
          className="rounded-full px-5"
        >
          Invite More Guests
        </Button>

        <Button
          type="button"
          variant="lime"
          disabled
          title="Resending invites is not available yet"
          className="rounded-full px-5"
        >
          Resend Invites
        </Button>
      </div>
    </div>
  );
};
