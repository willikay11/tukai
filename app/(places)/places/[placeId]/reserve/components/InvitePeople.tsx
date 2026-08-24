'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useFollowing } from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/user';

const nameOf = (user: User) =>
  user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Guest';

/**
 * Invitees for a reservation.
 *
 * The list is who the reader follows — `GET /accounts/users/?following=<id>` is
 * the only friend-shaped query the API offers.
 *
 * ⚠️ Invites are collected here and sent once the reservation exists: the only
 * invite endpoint is POST /experiences/{id}/guests/ (email only), which needs
 * the reservation's anchor experience. Nothing is sent while the form is open.
 */
export const InvitePeople = ({
  invitedEmails,
  onInvite,
  onRemove,
}: {
  invitedEmails: string[];
  onInvite: (email: string) => void;
  onRemove: (email: string) => void;
}) => {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [manualEntry, setManualEntry] = useState('');

  const { data: followingResponse, isLoading } = useFollowing(session?.user?.id ?? undefined);
  const following: User[] = followingResponse?.data?.results ?? [];

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return following;
    return following.filter((user) => nameOf(user).toLowerCase().includes(term));
  }, [following, query]);

  const isInvited = (email?: string) => Boolean(email && invitedEmails.includes(email));

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search friends on Tukai"
        className="text-[14px] leading-[18px]"
        icon={<IconComponent iconName="Search01Icon" size={18} className="text-gray-400" />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="py-4 text-sm text-gray-400">
          {query ? `No one matching "${query}"` : 'Nobody you follow yet — invite by email below.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {matches.map((user) => {
            const name = nameOf(user);
            const invited = isInvited(user.email);

            return (
              <li key={user.id} className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  <PhotoImage
                    src={user.picture}
                    alt={name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-600">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                  {user.email && <p className="truncate text-sm text-gray-400">{user.email}</p>}
                </div>

                <Button
                  size="sm"
                  variant={invited ? 'outline' : 'default'}
                  // Only an email can be invited — that is all the guest
                  // endpoint accepts
                  disabled={!user.email}
                  onClick={() =>
                    user.email && (invited ? onRemove(user.email) : onInvite(user.email))
                  }
                  className="flex-shrink-0 rounded-full px-5"
                >
                  {invited ? 'Invited' : 'Invite'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-3 pt-2">
        <span className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">or invite by email</span>
        <span className="h-px flex-1 bg-gray-100" />
      </div>

      <div className="flex items-center gap-3">
        <Input
          value={manualEntry}
          onChange={(event) => setManualEntry(event.target.value)}
          placeholder="name@email.com"
          type="email"
          className="text-[14px] leading-[18px]"
          containerClassName="flex-1"
        />
        <Button
          variant="outline"
          disabled={!manualEntry.includes('@')}
          onClick={() => {
            onInvite(manualEntry.trim());
            setManualEntry('');
          }}
          className="flex-shrink-0 rounded-full px-5"
        >
          Add
        </Button>
      </div>

      {invitedEmails.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {invitedEmails.map((email) => (
            <button
              key={email}
              type="button"
              onClick={() => onRemove(email)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              {email}
              <IconComponent iconName="Cancel01Icon" size={12} color="currentColor" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
