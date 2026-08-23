'use client';

import { useMemo, useState } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoData } from '@/components/ui/noData';
import { CommunityMember } from '@/types/community';

import { SectionShell } from './SectionShell';

const nameOf = (member: CommunityMember) =>
  member.user?.displayName ||
  `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() ||
  'Member';

const MemberRow = ({ member, action }: { member: CommunityMember; action: string }) => {
  const name = nameOf(member);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
        <PhotoImage
          src={member.user?.picture}
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

      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{name}</p>

      {/* ⚠️ No follow or messaging endpoints exist yet, so these cannot do
          anything. Shown disabled rather than omitted, so the row matches the
          design and the gap is visible. */}
      <Button
        variant="outline"
        size="sm"
        disabled
        title={`${action} is not available yet`}
        className="flex-shrink-0 rounded-full px-4"
      >
        {action}
      </Button>
    </div>
  );
};

export const MembersSection = ({ members }: { members: CommunityMember[] }) => {
  const [query, setQuery] = useState('');

  const { admins, regulars } = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matching = term
      ? members.filter((member) => nameOf(member).toLowerCase().includes(term))
      : members;

    return {
      admins: matching.filter((member) => member.role === 'admin' || member.role === 'owner'),
      regulars: matching.filter((member) => member.role !== 'admin' && member.role !== 'owner'),
    };
  }, [members, query]);

  return (
    <SectionShell id="members" title="Members">
      <Input
        placeholder="Find a member"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="text-[14px] leading-[18px]"
      />

      {admins.length === 0 && regulars.length === 0 ? (
        <div className="py-10">
          <NoData message={query ? `No members matching "${query}"` : 'No members yet'} />
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {admins.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Administrators
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {admins.map((member) => (
                  <MemberRow key={member.id} member={member} action="Message" />
                ))}
              </div>
            </div>
          )}

          {regulars.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Members ({regulars.length})
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {regulars.map((member) => (
                  <MemberRow key={member.id} member={member} action="Follow" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
};
