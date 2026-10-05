'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { nextFreeTime } from '@/app/shared/components/Plans/plan-this';
import { useMyBucketLists } from '@/app/shared/hooks/useBucketLists';
import { useSearch } from '@/app/shared/hooks/useSearch';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { usePlans } from '@/context/PlanContext';
import { cn } from '@/lib/utils';
import { BucketListDetail, bucketListItemLocation } from '@/types/bucket-list';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { DEFAULT_DURATION, Plan, PlanStop, minutesOf, timeLabel } from '@/types/plan';

type Tab = 'saved' | 'search' | 'custom';

type Candidate = {
  key: string;
  kind: 'experience' | 'place';
  refId: string;
  title: string;
  subtitle?: string;
  photo?: string | null;
  note?: string;
};

const TABS: Array<{ id: Tab; label: string; intro: string }> = [
  { id: 'saved', label: 'Saved', intro: 'Ideas from your bucket lists.' },
  {
    id: 'search',
    label: 'Search',
    intro: 'Anything listed on Tukai. Adding it never books it.',
  },
  {
    id: 'custom',
    label: 'Your own',
    // The canvas's own words, and the reason this tab exists
    intro: 'For anything not on Tukai, like picking someone up. Only you see it.',
  },
];

const Row = ({
  candidate,
  isAdded,
  onAdd,
}: {
  candidate: Candidate;
  isAdded: boolean;
  onAdd: () => void;
}) => (
  <li className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0">
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
      <PhotoImage
        src={candidate.photo ?? undefined}
        alt={candidate.title}
        fill
        sizes="48px"
        className="object-cover"
      />
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-gray-900">{candidate.title}</p>
      <p className="truncate text-13 text-ink-muted">
        {[candidate.subtitle, candidate.note].filter(Boolean).join(' · ')}
      </p>
    </div>

    {isAdded ? (
      <span className="flex-shrink-0 rounded-full bg-surface px-2.5 py-1 text-13 font-semibold text-ink-muted">
        Added
      </span>
    ) : (
      <Button
        type="button"
        variant="canvas-outline"
        size="sm"
        onClick={onAdd}
        className="flex-shrink-0 rounded-full"
      >
        Add
      </Button>
    )}
  </li>
);

/**
 * Adding a stop to a plan.
 *
 * Three ways in, as the canvas has them: something already saved, anything on
 * Tukai, or a stop of the reader's own for what Tukai does not list.
 */
export const AddStopDrawer = ({
  plan,
  isOpen,
  onClose,
}: {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const { addStop } = usePlans();
  const [tab, setTab] = useState<Tab>('saved');
  const [query, setQuery] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customWhere, setCustomWhere] = useState('');

  const { data: listsResponse, isLoading: areListsLoading } = useMyBucketLists(isOpen);
  const { data: searchResults, isFetching: isSearching } = useSearch(
    tab === 'search' ? query.trim() : undefined,
  );

  const saved: Candidate[] = useMemo(() => {
    const lists: BucketListDetail[] = listsResponse?.data?.results ?? [];
    const rows: Candidate[] = [];
    const seen = new Set<string>();

    lists.forEach((list) => {
      (list.items ?? []).forEach((item) => {
        const experience = item.experienceBookmark;
        const place = item.placeBookmark;
        const refId = experience?.experienceId ?? place?.placeId;
        const title = experience?.experienceTitle ?? place?.placeName;

        if (!refId || !title || seen.has(refId)) return;
        seen.add(refId);

        rows.push({
          key: refId,
          kind: experience ? 'experience' : 'place',
          refId,
          title,
          subtitle: bucketListItemLocation(item) || undefined,
          photo: (experience?.photo ?? place?.photo) as string | undefined,
          note: `From ${list.name}`,
        });
      });
    });

    return rows;
  }, [listsResponse]);

  const found: Candidate[] = useMemo(() => {
    const experiences: Experience[] = searchResults?.experiences ?? [];
    const places: Place[] = searchResults?.places ?? [];

    return [
      ...experiences.map((experience) => ({
        key: `e${experience.id}`,
        kind: 'experience' as const,
        refId: experience.id,
        title: experience.title,
        subtitle: experience.location?.city ?? undefined,
        photo: coverPhotoUrl(experience.photos, 'thumb'),
      })),
      ...places.map((place) => ({
        key: `p${place.id}`,
        kind: 'place' as const,
        refId: place.id,
        title: place.title,
        subtitle: place.location?.city ?? undefined,
        photo: coverPhotoUrl(place.photos, 'thumb'),
      })),
    ];
  }, [searchResults]);

  const isAdded = (refId: string) => plan.stops.some((stop) => stop.refId === refId);

  const add = (candidate: Candidate) => {
    // A new stop lands after the last one that has an end, so a day builds up
    // in order without the reader retyping times
    const time = nextFreeTime(plan);

    addStop(plan.id, {
      kind: candidate.kind,
      refId: candidate.refId,
      title: candidate.title,
      subtitle: candidate.subtitle,
      photo: candidate.photo ?? null,
      time,
      durationMinutes: DEFAULT_DURATION[candidate.kind],
    } as Omit<PlanStop, 'id'>);

    toast({
      title: `${candidate.title} added`,
      description: `At ${timeLabel(minutesOf(time))}. Nothing was booked.`,
      variant: 'success',
    });
  };

  const addCustom = () => {
    const title = customTitle.trim();
    if (!title) return;

    const time = nextFreeTime(plan);

    addStop(plan.id, {
      kind: 'custom',
      title,
      subtitle: customWhere.trim() || 'Your own stop',
      time,
      durationMinutes: DEFAULT_DURATION.custom,
    } as Omit<PlanStop, 'id'>);

    setCustomTitle('');
    setCustomWhere('');
    onClose();

    toast({
      title: `${title} added`,
      description: `At ${timeLabel(minutesOf(time))}. Only you can see this stop.`,
      variant: 'success',
    });
  };

  const rows = tab === 'saved' ? saved : found;
  const isLoadingRows = tab === 'saved' ? areListsLoading : isSearching;
  const intro = TABS.find((one) => one.id === tab)?.intro;

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && onClose()} width="narrow">
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Add a stop</h2>
        </div>

        <div className="flex flex-1 flex-col gap-4 px-6 py-5">
          <div role="tablist" aria-label="Where to add from" className="flex flex-wrap gap-2">
            {TABS.map((option) => {
              const isOn = tab === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={isOn}
                  onClick={() => setTab(option.id)}
                  className={cn(
                    'h-11 rounded-full px-4 text-15 transition-colors',
                    isOn
                      ? 'bg-brand-ink font-semibold text-white'
                      : 'bg-surface font-medium text-gray-900',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <p className="text-13 leading-relaxed text-ink-muted">{intro}</p>

          {tab === 'search' && (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search Tukai"
              placeholder="An experience, a place, a kind of activity"
              className="h-[52px] rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
            />
          )}

          {tab === 'custom' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="stop-title" className="text-15 font-semibold text-gray-900">
                  What is it?
                </label>
                <input
                  id="stop-title"
                  type="text"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value.slice(0, 60))}
                  placeholder="Pick Amina up"
                  className="h-[52px] rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="stop-where" className="text-15 font-semibold text-gray-900">
                  Where? <span className="font-normal text-ink-muted">(optional)</span>
                </label>
                <input
                  id="stop-where"
                  type="text"
                  value={customWhere}
                  onChange={(event) => setCustomWhere(event.target.value.slice(0, 60))}
                  placeholder="Westlands"
                  className="h-[52px] rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
                />
              </div>

              <p className="text-13 text-ink-muted">
                It lands at {timeLabel(minutesOf(nextFreeTime(plan)))}, after the last stop. You can
                change the time and how long it takes on the plan.
              </p>
            </div>
          ) : isLoadingRows ? (
            <div className="h-24 animate-pulse rounded-14 bg-gray-100" />
          ) : rows.length === 0 ? (
            <p className="rounded-14 bg-surface px-4 py-5 text-center text-15 leading-relaxed text-ink">
              {tab === 'saved'
                ? 'Nothing saved yet. Save experiences and places to a bucket list and they show up here.'
                : query.trim()
                  ? `Nothing matches “${query.trim()}”. Try a place name or a kind of activity.`
                  : 'Search for something to add.'}
            </p>
          ) : (
            <ul>
              {rows.map((candidate) => (
                <Row
                  key={candidate.key}
                  candidate={candidate}
                  isAdded={isAdded(candidate.refId)}
                  onAdd={() => add(candidate)}
                />
              ))}
            </ul>
          )}
        </div>

        {tab === 'custom' && (
          <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-danger">
              Cancel
            </Button>
            <Button
              type="button"
              variant="lime"
              onClick={addCustom}
              disabled={!customTitle.trim()}
              className="rounded-full px-6"
            >
              Add this stop
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};
