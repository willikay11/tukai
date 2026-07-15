import Image from 'next/image';

import { BucketListMember } from '@/types/bucket-list';

interface AvatarStackProps {
  users: BucketListMember[];
  max?: number;
}

export const AvatarStack = ({ users, max = 3 }: AvatarStackProps) => {
  if (users.length === 0) return null;

  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user) => (
        <div
          key={user.id}
          className="relative h-7 w-7 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white"
          title={user.name}
        >
          {user.picture ? (
            <Image src={user.picture} alt={user.name} fill sizes="28px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600 ring-2 ring-white">
          +{overflow}
        </div>
      )}
    </div>
  );
};
