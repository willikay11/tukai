'use client';

import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { Community } from '@/types/community';
import { Photo } from '@/types/photo';

import { SectionShell } from './SectionShell';

const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <IconComponent iconName={icon} size={24} className="mt-0.5 flex-shrink-0 text-gray-600" />
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export const AboutSection = ({
  community,
  upcomingCount,
}: {
  community: Community;
  upcomingCount: number;
}) => {
  const photos = (community.photos ?? [])
    .map((photo: Photo) => photo.photo)
    .filter((photo): photo is string => Boolean(photo));

  const memberCount = community.membersCount ?? community.members?.length ?? 0;

  // ⚠️ Only these two rows have a source. The API returns no phone, email,
  // location, meeting schedule or social links for a community, so those rows
  // from the design are not rendered rather than filled with placeholders.
  const details = [
    { icon: 'UserGroupIcon', label: 'Members', value: `${memberCount}` },
    {
      icon: 'Calendar03Icon',
      label: 'Experiences hosted',
      value: `${upcomingCount} upcoming`,
    },
  ];

  return (
    <SectionShell id="about">
      {photos.length > 0 && (
        <div className="mb-5">
          <SquarePhotoStrip photos={photos} variant="hero" />
        </div>
      )}

      <div className="text-sm text-gray-600">
        <DescriptionShowMore text={community.description} />
      </div>

      {community.categories?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {community.categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
            >
              <IconComponent iconName={category.icon} size={16} />
              {category.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-gray-900">Details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
};
