'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { CommunityMember } from '@/types/community';
import clsx from 'clsx';

export default function CommunityMembers({
  members,
  size = '20px',
}: {
  members: CommunityMember[];
  size?: string;
}) {
  return (
    <div className="relative flex items-center">
      {members.slice(0, 5).map((member: CommunityMember, index: number) => (
        <div
          key={member.id}
          className={clsx(
            'relative rounded-full bg-gray-200',
            index === 0 && 'ml-0',
            index > 0 && `-ml-1`,
          )}
        >
          <Avatar className={`h-[${size}] w-[${size}]`}>
            <AvatarImage src={member.user.picture} />
          </Avatar>
        </div>
      ))}
      {members.length > 5 && (
        <span className="ml-1 text-xs font-medium text-gray-700">{`+${members.length - 5}`}</span>
      )}
    </div>
  );
}
