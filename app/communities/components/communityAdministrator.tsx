'use client';

import { useState } from 'react';

import SendMessage from '@/app/components/sendMessage';
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <SendMessage open={open} setOpen={setOpen} recipientId={member.user.id} />
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
        <Button variant="primary-light" className="h-full" onClick={() => setOpen(true)}>
          Send Message
        </Button>
      </div>
    </>
  );
}
