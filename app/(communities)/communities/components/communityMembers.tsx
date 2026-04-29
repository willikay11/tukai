'use client';

import Image from 'next/image';

import clsx from 'clsx';

import { CommunityMember } from '@/types/community';

export const CommunityMembers = ({
  members,
  size = '20px',
}: {
  members: CommunityMember[];
  size?: string;
}) => {
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
          <div className={`relative aspect-square`} style={{ width: size, height: size }}>
            <Image
              src={member?.user?.picture || ''}
              alt={member?.user?.firstName || ''}
              className="h-7 w-7 rounded-full"
              quality={100}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      ))}
      {members.length > 5 && (
        <span className="ml-1 text-xs font-medium text-gray-700">{`+${members.length - 5}`}</span>
      )}
    </div>
  );
};
