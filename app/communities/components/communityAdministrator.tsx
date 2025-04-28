'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommunityMember } from '@/types/community';

export default function CommunityAdministrator({
  member,
  size = '30px',
}: {
  member: CommunityMember;
  size: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <Avatar className={`h-[${size}] w-[${size}]`}>
        <AvatarImage src={member.user.picture} />
      </Avatar>
      <div className="flex flex-col">
        <p className="text-sm font-bold text-gray-700">
          {member.user.firstName} {member.user.lastName}
        </p>
        <p className="text-sm font-normal text-gray-500">{member.role}</p>
      </div>
      <Button variant="primary-light" className="h-full">
        Send Message
      </Button>
    </div>
  );
}
