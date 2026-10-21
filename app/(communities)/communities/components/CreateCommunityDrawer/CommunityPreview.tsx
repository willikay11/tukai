'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { OpenInMapsLink } from '@/app/shared/components/Global/OpenInMapsLink';
import { Interest } from '@/types/interest';

import type { CommunityVisibility, DraftPhoto, InvitedPerson } from './useCreateCommunityDrawer';

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

interface CommunityPreviewProps {
  photos: DraftPhoto[];
  name: string;
  description: string;
  visibility: CommunityVisibility;
  categories: Interest[];
  selectedCategoryIds: string[];
  invitedPeople: InvitedPerson[];
  invitedCommunityNames: string[];
  city?: string;
  lat?: number;
  lng?: number;
}

export const CommunityPreview = ({
  photos,
  name,
  description,
  visibility,
  categories,
  selectedCategoryIds,
  invitedPeople,
  invitedCommunityNames,
  city,
  lat,
  lng,
}: CommunityPreviewProps) => {
  const selectedCategories = categories.filter((category) => selectedCategoryIds.includes(category.id));

  return (
    <div className="flex flex-col gap-7">
      {photos.length > 0 && (
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 scrollbar-hide">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="h-60 w-60 flex-shrink-0 rounded-xl bg-surface object-cover"
            />
          ))}
        </div>
      )}

      <div className="-mt-1.5 flex flex-col gap-2.5">
        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.5px] text-gray-800">
          {name.trim() || 'Untitled community'}
        </h2>

        <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-800">
          {description.trim() || 'No description yet.'}
        </p>

        <p className="text-sm text-ink-muted">
          {visibility === 'public'
            ? 'Public. Anyone can join straight away.'
            : 'Private. Only people you invite can join.'}
        </p>
      </div>

      <div className="h-px bg-[#E5E7EB]" aria-hidden="true" />

      <section className="flex flex-col gap-3.5">
        <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
          Location <span className="font-normal tracking-normal text-ink-muted">(city)</span>
        </h3>

        <div className="flex items-center gap-4">
          <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-xl bg-surface text-gray-800">
            <IconComponent iconName="Building03Icon" size={28} color="currentColor" />
          </span>

          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="min-h-[26px] text-[15px] font-semibold text-gray-800">
              {city ?? 'Your city'}
            </span>

            <OpenInMapsLink
              lat={lat}
              lng={lng}
              query={city}
              className="-my-2.5 min-h-11 gap-1.5 self-start text-sm font-semibold text-brand"
            >
              <IconComponent iconName="Location01Icon" size={17} color="currentColor" />
              View on Google Maps
            </OpenInMapsLink>
          </div>
        </div>
      </section>

      {selectedCategories.length > 0 && (
        <>
          <div className="h-px bg-[#E5E7EB]" aria-hidden="true" />

          <section className="flex flex-col gap-3.5">
            <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">Categories</h3>

            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-surface px-4 text-[14.5px] text-gray-800"
                >
                  {category.icon && (
                    <IconComponent
                      iconName={category.icon}
                      size={18}
                      color="currentColor"
                      className="-ml-0.5"
                    />
                  )}
                  {category.name}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {invitedPeople.length > 0 && (
        <>
          <div className="h-px bg-[#E5E7EB]" aria-hidden="true" />

          <section className="flex flex-col gap-3.5">
            <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
              Invited members ({invitedPeople.length})
            </h3>

            <div className="flex flex-wrap gap-2">
              {invitedPeople.map((person) => (
                <span
                  key={person.id}
                  className="inline-flex h-[52px] max-w-full items-center gap-2.5 rounded-full bg-surface py-0 pl-1.5 pr-[18px]"
                >
                  {person.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.image}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E8E5] text-[15px] font-semibold text-ink">
                      {initial(person.name)}
                    </span>
                  )}
                  <span className="max-w-[200px] truncate text-[15px] text-gray-800">
                    {person.name}
                  </span>
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {invitedCommunityNames.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
            Invited communities ({invitedCommunityNames.length})
          </h3>

          <div className="flex flex-wrap gap-2">
            {invitedCommunityNames.map((communityName) => (
              <span
                key={communityName}
                className="inline-flex h-[52px] max-w-full items-center gap-2.5 rounded-full bg-surface py-0 pl-1.5 pr-[18px]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E8E5] text-[15px] font-semibold text-ink">
                  {initial(communityName)}
                </span>
                <span className="max-w-[200px] truncate text-[15px] text-gray-800">
                  {communityName}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
