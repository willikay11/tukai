'use client';

import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { PlacePhotoStrip } from '@/app/shared/components/Places/PlaceDrawer/PlacePhotoStrip';
import { Community } from '@/types/community';

import { COMMUNITY_SECTIONS } from './tabs';

/** The handoff's "Show more" threshold on the About text. */
const ABOUT_MAX_LENGTH = 180;

/**
 * Photos, the city chip, description and categories - the Communities
 * handoff's Photos / City chip / About blocks, kept together since they sit
 * back to back with nothing else between them.
 *
 * Contact details and Socials are left out: the `Community` type carries no
 * phone, email or socials fields yet (see the drawer fork's report for the
 * backend-gap list).
 */
export const CommunityAboutSection = ({ community }: { community: Community }) => {
  const photos = (community.photos ?? [])
    .map((photo) => photo.photo)
    .filter((photo): photo is string => Boolean(photo))
    .slice(0, 8);

  const city = community.location?.city;

  return (
    <section id={COMMUNITY_SECTIONS.about} className="scroll-mt-[148px] space-y-5">
      {photos.length > 0 && (
        <div className="-mx-6 px-6">
          <PlacePhotoStrip photos={photos} alt={community.title} />
        </div>
      )}

      {city && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[14.5px] text-ink-muted">
            <IconComponent
              iconName="Building03Icon"
              size={19}
              color="currentColor"
              className="text-brand"
            />
            {city}, Kenya
          </span>
        </div>
      )}

      <DescriptionShowMore text={community.description} maxLength={ABOUT_MAX_LENGTH} />

      {community.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {community.categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-gray-700"
            >
              <IconComponent iconName={category.icon} size={16} color="currentColor" />
              {category.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
