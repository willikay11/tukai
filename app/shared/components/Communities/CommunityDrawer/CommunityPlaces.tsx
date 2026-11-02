'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { CommunityPlace } from '@/types/community';
import { Place } from '@/types/place';

import { Divider } from './parts';
import { COMMUNITY_SECTIONS, SECTION_SCROLL_MARGIN } from './tabs';

/** The title that opens a fuller list - Places and Reviews share it. */
export const SectionLinkTitle = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="-my-2.5 inline-flex min-h-11 items-center gap-1.5 self-start text-19 font-bold tracking-[-0.2px] text-gray-800 transition-colors hover:text-brand"
  >
    {label}
    <IconComponent
      iconName="ArrowRight01Icon"
      size={20}
      color="currentColor"
      className="text-ink-muted"
    />
  </button>
);

/**
 * A verified business's own places, or where any other community meets. The
 * cards are the app's own place card, and open the place on top.
 */
export const CommunityPlaces = ({
  communityTitle,
  places,
  isOwned,
}: {
  communityTitle: string;
  places: CommunityPlace[];
  isOwned: boolean;
}) => {
  const { toast } = useToast();

  if (places.length === 0) return null;

  const sub = isOwned
    ? `${places.length} ${places.length === 1 ? 'place' : 'places'} owned by ${communityTitle}`
    : `Places ${communityTitle} meets at`;

  return (
    <>
      <section
        id={COMMUNITY_SECTIONS.places}
        className={cn('flex flex-col gap-3.5', SECTION_SCROLL_MARGIN)}
      >
        <div>
          <SectionLinkTitle
            label="Places"
            onClick={() =>
              toast({ description: `Opens every place connected to ${communityTitle}.` })
            }
          />
          <p className="mt-1.5 text-sm leading-[1.45] text-ink-muted [text-wrap:pretty]">{sub}</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3.5 gap-y-[22px]">
          {places.map((place) => (
            // The community carries a place summary, not the full record; the
            // card reads only what the summary has and opens the rest
            <PlaceCard key={place.id} place={place as unknown as Place} className="w-full" />
          ))}
        </div>
      </section>
      <Divider />
    </>
  );
};
