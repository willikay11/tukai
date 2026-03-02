'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { InviteCommunities, InvitedCommunity } from '@/components/ui/invite-communities';
import { InviteMembers, InvitedMember } from '@/components/ui/invite-members';

export default function CreateExperienceInvites() {
  const initialInvitedMembers: InvitedMember[] = [
    { id: 'user-1', name: 'Brooklyn...', image: '/images/seven.jpg' },
    { id: 'user-2', name: 'Kimberly...', image: '/images/eight.jpg' },
    { id: 'user-3', name: 'Marvin...', image: '/images/santorini.webp' },
    { id: 'email-1', name: 'gralak@gmail...', email: 'gralak@gmail.com' },
    { id: 'user-4', name: 'Marvin...', image: '/images/eight.jpg' },
    { id: 'user-5', name: 'Eleanor...', image: '/images/seven.jpg' },
    ...Array.from({ length: 34 }, (_, index) => ({
      id: `user-seed-${index + 1}`,
      name: `Guest ${index + 1}`,
      image: index % 2 === 0 ? '/images/seven.jpg' : '/images/eight.jpg',
    })),
  ];

  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>(initialInvitedMembers);
  const [searchQuery, setSearchQuery] = useState('');

  const [availableCommunities] = useState<InvitedCommunity[]>([
    { id: 'c1', name: 'Let’s Drift', image: '/images/seven.jpg' },
    { id: 'c2', name: 'The Mara Nomads', image: '/images/eight.jpg' },
    { id: 'c3', name: 'A Longer Communities Name', image: '/images/santorini.webp' },
    { id: 'c4', name: 'Let’s Drift', image: '/images/seven.jpg' },
    { id: 'c5', name: 'The Mara Nomads', image: '/images/eight.jpg' },
    { id: 'c6', name: 'Nomad Cyclers', image: '/images/santorini.webp' },
  ]);

  const [invitedCommunities, setInvitedCommunities] = useState<InvitedCommunity[]>([
    availableCommunities[0],
    availableCommunities[1],
    availableCommunities[2],
    availableCommunities[3],
    availableCommunities[4],
  ]);

  const allUsers = useMemo<InvitedMember[]>(
    () => [
      {
        id: 'user-101',
        name: 'Brooklyn West',
        email: 'brooklyn@example.com',
        image: '/images/seven.jpg',
      },
      {
        id: 'user-102',
        name: 'Kimberly Rose',
        email: 'kimberly@example.com',
        image: '/images/eight.jpg',
      },
      {
        id: 'user-103',
        name: 'Marvin Cole',
        email: 'marvin@example.com',
        image: '/images/santorini.webp',
      },
      {
        id: 'user-104',
        name: 'Eleanor Lane',
        email: 'eleanor@example.com',
        image: '/images/seven.jpg',
      },
    ],
    [],
  );

  const memberSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) => user.name.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q),
    );
  }, [allUsers, searchQuery]);

  return (
    <div className="w-full">
      <div className="bg-white">
        <h1 className="text-base font-semibold leading-tight text-gray-900">
          Invite your friends and communities
        </h1>

        <p className="mt-4 text-xs text-gray-800">
          You can share invites individually or invite members of a given Communities that you own
          or are a member of.
        </p>

        <InviteMembers
          invitedMembers={invitedMembers}
          onMembersChange={setInvitedMembers}
          searchResults={memberSearchResults}
          onSearch={setSearchQuery}
          className="mt-6"
        />

        <p className="mt-6 text-xs font-semibold text-gray-800">Your communities</p>
        <p className="mt-2 text-xs text-gray-700">
          Select your communities you would like to invite:
        </p>

        <InviteCommunities
          invitedCommunities={invitedCommunities}
          onCommunitiesChange={setInvitedCommunities}
          availableCommunities={availableCommunities}
        />

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" className="text-sm text-red-500 hover:text-red-600">
            Cancel
          </button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-primary px-6 text-xs font-semibold text-primary"
            >
              Save &amp; Exit
            </Button>
            <Button
              type="button"
              variant="gradient"
              className="rounded-full px-6 text-xs font-semibold text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
