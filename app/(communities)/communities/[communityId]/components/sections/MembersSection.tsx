'use client';

import { useEffect, useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { SectionShell } from '@/app/shared/components/Sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoData } from '@/components/ui/noData';
import { CommunityMember } from '@/types/community';

// Four rows of the two-column grid
const PAGE_SIZE = 8;

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
  const [page, setPage] = useState(1);

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

  // Administrators are a handful and head the section, so only the member list
  // pages. The community detail endpoint hands over every member at once, so
  // this pages what is already here rather than fetching.
  const pageCount = Math.max(Math.ceil(regulars.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, pageCount);
  const visibleRegulars = regulars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // A narrowing search can strand the reader past the end of the new results
  useEffect(() => setPage(1), [query]);

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
                {visibleRegulars.map((member) => (
                  <MemberRow key={member.id} member={member} action="Follow" />
                ))}
              </div>

              {pageCount > 1 && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-400" aria-live="polite">
                    Page {currentPage} of {pageCount}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Previous page of members"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                      className="rounded-full"
                    >
                      <IconComponent iconName="ArrowLeft01Icon" size={16} color="currentColor" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Next page of members"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(currentPage + 1)}
                      className="rounded-full"
                    >
                      <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
};
