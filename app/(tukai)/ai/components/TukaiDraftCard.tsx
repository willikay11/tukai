/* eslint-disable @next/next/no-img-element */
import type { TukaiDraft, TukaiItem } from '@/types/tukai';
import { shortDay, toTwelveHour } from '@/utils/tukai';

const TYPES: Record<TukaiDraft['type'], string> = {
  one: 'One day',
  multi: 'Multi-day',
  itin: 'Itinerary',
};

/**
 * An experience TukAI drafted for a community the person owns.
 *
 * ⚠️ The handoff's "Open as draft" button is held back: Create experience
 * cannot yet start from prefilled fields, and a button that opened it empty
 * would not do what it says.
 */
export const TukaiDraftCard = ({
  draft,
  place,
  communityTitle,
}: {
  draft: TukaiDraft;
  place?: TukaiItem;
  communityTitle?: string;
}) => {
  const typeLine = [
    TYPES[draft.type] ?? 'One day',
    shortDay(draft.date),
    draft.start
      ? `${toTwelveHour(draft.start)}${draft.end ? ` - ${toTwelveHour(draft.end)}` : ''}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="my-[18px] flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-brand">
        <img
          src="/images/icons/pill-calendar-bulk-green.svg"
          alt=""
          className="block h-4 w-4 flex-shrink-0"
        />
        Experience draft
      </span>
      <span className="text-pretty text-base font-bold leading-[1.3] text-gray-800">
        {draft.title}
      </span>
      <span className="text-[13.5px] leading-[1.45] text-ink-note">{typeLine}</span>
      <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13.5px] leading-[1.45] text-ink-muted">
        <span>{place?.title ?? 'Place not chosen yet'}</span>
        <span>
          {draft.price > 0 ? `KES ${draft.price.toLocaleString('en-US')} a ticket` : 'Free'}
        </span>
        {communityTitle && <span>For {communityTitle}</span>}
      </span>
      {draft.desc && (
        <p className="m-0 mt-0.5 line-clamp-4 whitespace-pre-line text-sm leading-normal text-gray-800">
          {draft.desc}
        </p>
      )}
    </div>
  );
};
