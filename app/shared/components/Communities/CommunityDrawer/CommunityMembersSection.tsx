'use client';

import { useMemo, useState } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoData } from '@/components/ui/noData';
import { CommunityMember } from '@/types/community';

import { nameOfMember } from './community-drawer';
import { COMMUNITY_SECTIONS } from './tabs';

// Shown before a "Show N more" reveals the rest - keeps a long roster from
// pushing everything else below it out of the first screenful
const VISIBLE_REGULARS = 8;

const MemberRow = ({ member }: { member: CommunityMember }) => {
  const name = nameOfMember(member);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
        <PhotoImage
          src={member.user?.picture}
          alt={name}
          fill
          sizes="40px"
          className="object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand">
              {name.charAt(0).toUpperCase()}
            </div>
          }
        />
      </div>

      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{name}</p>
    </div>
  );
};

export const CommunityMembersSection = ({ members }: { members: CommunityMember[] }) => {
  const [query, setQuery] = useState('');
  const [showAllRegulars, setShowAllRegulars] = useState(false);

  const { admins, regulars } = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matching = term
      ? members.filter((member) => nameOfMember(member).toLowerCase().includes(term))
      : members;

    return {
      admins: matching.filter((member) => member.role === 'admin' || member.role === 'owner'),
      regulars: matching.filter((member) => member.role !== 'admin' && member.role !== 'owner'),
    };
  }, [members, query]);

  const visibleRegulars = showAllRegulars ? regulars : regulars.slice(0, VISIBLE_REGULARS);
  const hiddenCount = regulars.length - visibleRegulars.length;

  return (
    <section id={COMMUNITY_SECTIONS.members} className="scroll-mt-[148px] space-y-5">
      <h2 className="text-19 font-bold text-gray-900">Members</h2>

      <Input
        placeholder="Find a member"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShowAllRegulars(false);
        }}
        className="text-[14px] leading-[18px]"
      />

      {admins.length === 0 && regulars.length === 0 ? (
        <div className="py-8">
          <NoData message={query ? `No members matching "${query}"` : 'No members yet'} />
        </div>
      ) : (
        <div className="space-y-5">
          {admins.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Administrators
              </p>
              <div className="space-y-2">
                {admins.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {regulars.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Members ({regulars.length})
              </p>
              <div className="space-y-2">
                {visibleRegulars.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </div>

              {hiddenCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllRegulars(true)}
                  className="w-full rounded-full"
                >
                  Show {hiddenCount} more
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
