'use client';

import { PhotoImage } from '@/app/shared/components/Images';
import { useToast } from '@/app/shared/hooks/useToast';
import { CommunityMember } from '@/types/community';

import { nameOfMember } from './community-drawer';
import { COMMUNITY_SECTIONS } from './tabs';

/** Chips shown before the "+{rest}" overflow chip takes over. */
const MAX_CHIPS = 9;

const MemberChip = ({ member, role }: { member: CommunityMember; role?: string }) => {
  const name = nameOfMember(member);

  return (
    <span className="inline-flex h-11 max-w-[220px] items-center gap-2 rounded-full bg-surface px-[5px] pr-4 text-sm text-gray-900">
      <span className="relative h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
        <PhotoImage
          src={member.user?.picture}
          alt=""
          fill
          sizes="34px"
          className="object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center text-[13px] font-bold text-brand-ink">
              {name.charAt(0).toUpperCase()}
            </div>
          }
        />
      </span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {role && <span className="flex-shrink-0 text-[12.5px] font-semibold text-brand">{role}</span>}
    </span>
  );
};

/**
 * The handoff's member chip roster: the owner first (labelled "Admin", or
 * "You" when it is the signed-in reader), then the reader's own chip if they
 * are a separate member, then the rest - up to 9 chips, with a "+{rest}"
 * overflow chip that toasts for now (there is nowhere real for it to go yet).
 */
export const CommunityMembersSection = ({
  members,
  currentUserId,
}: {
  members: CommunityMember[];
  currentUserId?: string;
}) => {
  const { toast } = useToast();
  const memberCount = members.length;

  const owner = members.find((member) => member.role === 'owner');
  const isOwnerSelf = owner?.user?.id === currentUserId;
  const self = members.find((member) => member.user?.id === currentUserId);
  const showSelfSeparately = Boolean(self) && !isOwnerSelf;

  const rest = members.filter(
    (member) => member.id !== owner?.id && (!showSelfSeparately || member.id !== self?.id),
  );

  const ordered = [
    ...(owner ? [{ member: owner, role: isOwnerSelf ? 'You' : 'Admin' }] : []),
    ...(showSelfSeparately && self ? [{ member: self, role: 'You' }] : []),
    ...rest.map((member) => ({ member, role: undefined })),
  ];

  const visible = ordered.slice(0, MAX_CHIPS);
  const overflow = ordered.length - visible.length;

  return (
    <section id={COMMUNITY_SECTIONS.members} className="scroll-mt-[148px] space-y-3.5">
      <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">Members</h3>
      <p className="-mt-1 text-sm leading-snug text-ink-muted">
        {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </p>

      <div className="flex flex-wrap gap-2">
        {visible.map(({ member, role }) => (
          <MemberChip key={member.id} member={member} role={role} />
        ))}

        {overflow > 0 && (
          <button
            type="button"
            onClick={() => toast({ description: `See all ${memberCount} members` })}
            aria-label={`See all ${memberCount} members`}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-surface-brand px-3.5 text-sm font-bold text-brand transition-colors hover:bg-surface-tab"
          >
            +{overflow}
          </button>
        )}
      </div>

      {ordered.length === 0 && (
        <p className="text-sm leading-snug text-ink-muted">No members yet.</p>
      )}
    </section>
  );
};
