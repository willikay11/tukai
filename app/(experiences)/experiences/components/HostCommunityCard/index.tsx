import Image from 'next/image';
import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';

interface HostCommunityCardProps {
  community: {
    id: string;
    title: string;
    photos?: Array<{ photo?: string; url?: string }>;
    experiencesHostedCount?: number;
  };
}

export const HostCommunityCard = ({ community }: HostCommunityCardProps) => {
  const photoUrl =
    community.photos?.[0]?.photo || community.photos?.[0]?.url || '';

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">Host Community</h3>
      <Link target='_blank' href={`/communities/${community.id}`}>
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity">
          {photoUrl && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={photoUrl}
                alt={community.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm">{community.title}</p>
              <IconComponent
                iconName="ArrowUpRight01Icon"
                size={13}
                className="text-primary"
              />
            </div>
            {community.experiencesHostedCount !== undefined && (
              <p className="text-xs text-gray-500">
                {community.experiencesHostedCount} Experiences hosted
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
