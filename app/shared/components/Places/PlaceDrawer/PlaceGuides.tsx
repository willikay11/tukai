'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceGuides } from '@/app/shared/hooks/usePlaces';
import { experiencesLine, guideName } from '@/types/placeLinks';

/**
 * Tour guides who lead experiences at this place (DEV-386), most experiences
 * first, as the design's sideways row of cards. Renders nothing when there
 * are none.
 *
 * The design gives each card a View button for the guide's profile; the web
 * has no page for another person's profile yet, so the card is just the guide.
 */
export const PlaceGuides = ({ placeId }: { placeId: string }) => {
  const { data: guides = [] } = usePlaceGuides(placeId);

  if (guides.length === 0) return null;

  return (
    <section aria-label="Tour guides" className="flex flex-col gap-4 py-6">
      <h3 className="text-[19px] font-bold tracking-[-0.2px] text-gray-800">Tour guides</h3>
      <ul className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2.5 scrollbar-hide">
        {guides.map((guide) => {
          const name = guideName(guide);
          return (
            <li
              key={guide.id}
              className="flex flex-none items-center gap-3 rounded-2xl border border-line-shell bg-gray-50 py-2.5 pl-3 pr-4"
            >
              <PhotoImage
                src={guide.user.picture ?? undefined}
                alt=""
                width={48}
                height={48}
                sizes="48px"
                className="h-12 w-12 flex-none rounded-full bg-surface-brand object-cover"
              />
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="flex items-center gap-[5px] whitespace-nowrap text-15 font-semibold text-gray-800">
                  {name}
                  <span role="img" aria-label="Verified guide" className="flex text-brand">
                    <IconComponent
                      iconName="CheckmarkBadge01Icon"
                      variant="bulk"
                      size={17}
                      color="currentColor"
                    />
                  </span>
                </span>
                <span className="whitespace-nowrap text-[13.5px] text-ink-muted">
                  {experiencesLine(guide.experiencesCount)}
                  {guide.averageRating ? ` · ★ ${guide.averageRating.toFixed(1)}` : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
