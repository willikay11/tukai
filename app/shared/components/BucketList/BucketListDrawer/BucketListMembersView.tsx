'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { BucketListDetail, BucketListMember } from '@/types/bucket-list';
import { LinkedUser, linkedUserName } from '@/types/user';

const Face = ({ user }: { user?: LinkedUser | null }) => (
  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
    <PhotoImage
      src={user?.picture}
      alt={linkedUserName(user)}
      fill
      sizes="44px"
      className="object-cover"
      fallback={
        <div className="flex h-full w-full items-center justify-center text-base font-bold text-brand">
          {linkedUserName(user).charAt(0).toUpperCase()}
        </div>
      }
    />
  </div>
);

const MemberRow = ({ user, role }: { user?: LinkedUser | null; role: string }) => (
  <li className="flex items-center gap-3 px-1 py-2.5">
    <Face user={user} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-[15.5px] font-semibold text-gray-900">{linkedUserName(user)}</p>
      <p className="text-13 text-ink-muted">{role}</p>
    </div>
  </li>
);

/**
 * Who is on this list - the owner's chip and the members chip both open this.
 *
 * Read-only: the API has a way to leave a list but none to remove someone
 * else from it, so there is nothing here for an owner to press beyond what
 * the drawer's own footer already offers.
 */
export const BucketListMembersView = ({ bucketList }: { bucketList: BucketListDetail }) => {
  const acceptedMembers = (bucketList.members ?? []).filter(
    (member: BucketListMember) => member.status === 'accepted',
  );

  return (
    <div className="flex flex-col gap-1">
      {bucketList.owner && <MemberRow user={bucketList.owner} role="Owner" />}

      {acceptedMembers.length === 0 ? (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-13 text-ink-muted">
          <IconComponent iconName="InformationCircleIcon" size={16} color="currentColor" />
          Nobody else has joined this list yet.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {acceptedMembers.map((member) => (
            <MemberRow key={member.id} user={member.user} role="Member" />
          ))}
        </ul>
      )}
    </div>
  );
};
