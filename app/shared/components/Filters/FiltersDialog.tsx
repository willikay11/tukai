'use client';

import { ReactNode, useEffect, useState } from 'react';

import { matchesYourCommunities } from '@/app/shared/components/Filters/community';
import { DURATION_BANDS, matchesDuration } from '@/app/shared/components/Filters/duration';
import { matchesPrice } from '@/app/shared/components/Filters/price';
import {
  DISTANCE_BANDS,
  NAIROBI_CENTER,
  matchesDistance,
  matchesInterests,
} from '@/app/shared/components/Filters/where';
import { IconComponent } from '@/app/shared/components/Icons';
import { isOngoing } from '@/app/shared/components/Places/PlaceDrawer/happening-now';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSearchResults } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';
import { ResultType, SearchFilters } from '@/types/search';

import { RESULT_TYPES, clearedFilters } from './filters';
import { EXPERIENCE_SHAPES, matchesShapes } from './shapes';
import { QUICK_DATES, TIME_OF_DAY, matchesQuickDate, matchesTimeOfDay } from './when';

const Section = ({
  icon,
  title,
  hint,
  children,
}: {
  icon: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) => (
  <section className="border-b border-surface-muted px-6 py-5 last:border-b-0">
    <div className="flex items-center gap-2.5">
      <IconComponent iconName={icon} size={20} color="currentColor" className="text-brand" />
      <h3 className="text-lg font-bold text-brand-ink">{title}</h3>
    </div>
    <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>
    <div className="mt-4">{children}</div>
  </section>
);

/** A toggle card: an icon, what it is, what it means, and a switch. */
const ToggleCard = ({
  icon,
  label,
  description,
  isOn,
  onToggle,
  disabled,
}: {
  icon: string;
  label: string;
  description: string;
  isOn: boolean;
  onToggle: () => void;
  /** No backing data yet - shown to match the canvas, but not interactive. */
  disabled?: boolean;
}) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-2xl p-4 transition-colors',
      disabled ? 'bg-surface opacity-50' : isOn ? 'bg-surface-brand' : 'bg-surface',
    )}
  >
    <IconComponent
      iconName={icon}
      size={22}
      color="currentColor"
      className="mt-0.5 flex-shrink-0 text-brand"
    />

    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[15px] font-bold text-brand-ink">{label}</span>
      <span className="text-[13px] leading-snug text-ink-muted">{description}</span>
    </span>

    <Switch
      checked={isOn}
      aria-label={label}
      onCheckedChange={onToggle}
      disabled={disabled}
      className="mt-0.5"
    />
  </div>
);

/** A pill button, the shape every single-pick row in this panel shares. */
const Pill = ({
  isOn,
  onClick,
  children,
  disabled,
}: {
  isOn: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    type="button"
    aria-pressed={isOn}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold transition-colors',
      disabled
        ? 'cursor-not-allowed bg-surface text-ink-subtle opacity-50'
        : isOn
          ? 'bg-surface-brand text-brand'
          : 'bg-surface text-brand-ink hover:brightness-[0.97]',
    )}
  >
    {children}
  </button>
);

const PRICE_CEILING = 10000;
const PRICE_STEP = 500;
const thumbClass =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-white';

/** Per-person price, From/Up to - "Up to" pins at the ceiling reads as "10,000+". */
const PriceRangeSlider = ({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) => {
  const percent = (value: number) => (value / PRICE_CEILING) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] text-ink-muted">From</span>
          <span className="text-[15px] font-bold text-brand-ink">KES {min.toLocaleString()}</span>
        </span>
        <span className="flex flex-col items-end gap-0.5">
          <span className="text-[13px] text-ink-muted">Up to</span>
          <span className="text-[15px] font-bold text-brand-ink">
            KES {max >= PRICE_CEILING ? `${PRICE_CEILING.toLocaleString()}+` : max.toLocaleString()}
          </span>
        </span>
      </div>

      <div className="relative mt-4 h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${percent(min)}%`, right: `${100 - percent(max)}%` }}
        />

        <input
          type="range"
          min={0}
          max={PRICE_CEILING}
          step={PRICE_STEP}
          value={min}
          aria-label="Minimum price per person"
          onChange={(event) => onChange(Math.min(Number(event.target.value), max), max)}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent',
            thumbClass,
          )}
        />
        <input
          type="range"
          min={0}
          max={PRICE_CEILING}
          step={PRICE_STEP}
          value={max}
          aria-label="Maximum price per person"
          onChange={(event) => onChange(min, Math.max(Number(event.target.value), min))}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent',
            thumbClass,
          )}
        />
      </div>
    </div>
  );
};

// The canvas's own neighbourhood names - no `group: 'areas'` exists on the
// API to fetch these for real, or to count places in each one. Shown to
// match the canvas rather than left out, but inert: see AREA_NAMES below.
const AREA_NAMES = [
  'Westlands',
  'Kilimani',
  'Karen',
  'CBD',
  'Langata',
  'Kileleshwa',
  'Lavington',
  'Naivasha',
  'Ngong Road',
  'Kajiado',
  'State House Road',
  'Ngong',
];

const INITIAL_INTERESTS_SHOWN = 12;

/**
 * Narrowing a search.
 *
 * ⚠️ Several of these have no endpoint behind them at all - distance,
 * duration, a price range, "happening now", "your communities" (the API
 * offers "followed", not "joined") and guided tours are matched off the rows
 * that come back rather than sent as the request's own narrowing, the same
 * reason `matchesShapes` exists. Area, step-free access and parking have no
 * backing data anywhere yet - rendered to match the canvas, but inert.
 */
export const FiltersDialog = ({
  filters,
  isOpen,
  onClose,
  onApply,
  children,
}: {
  filters: SearchFilters;
  isOpen: boolean;
  onClose: () => void;
  onApply: (next: SearchFilters) => void;
  /** What the panel hangs under - the search bar, or the bar's own Edit filters button. */
  children: ReactNode;
}) => {
  const [draft, setDraft] = useState(filters);
  // Whether "Pick dates" is the live choice, shown by uncovering the date
  // picker rather than by a draft field of its own
  const [isPickingDate, setIsPickingDate] = useState(Boolean(filters.date));
  const [showAllInterests, setShowAllInterests] = useState(false);

  // The dialog stays mounted between openings, so the controls follow what is
  // in force when it opens rather than what was last abandoned
  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
      setIsPickingDate(Boolean(filters.date));
      setShowAllInterests(false);
    }
  }, [isOpen, filters]);

  const { data: citiesResponse } = usePlaceCategories({ group: 'cities', pageSize: 100 }, isOpen);
  const { data: interestsResponse } = usePlaceCategories(
    { group: 'interests', pageSize: 100 },
    isOpen,
  );
  const { lat, lng, requestLocation } = useLocation();
  const { data: followedResponse } = useGetCommunities({
    page: 1,
    enabled: isOpen && draft.yourCommunitiesOnly,
    following: true,
  });
  // Counted against the draft, so the numbers follow the controls as they move
  const { data: preview } = useSearchResults({ ...draft, type: 'all' }, isOpen);

  const cities: PlaceCategory[] = citiesResponse?.data?.results ?? [];
  const interests: PlaceCategory[] = interestsResponse?.data?.results ?? [];
  const followedCommunityIds: string[] = (followedResponse?.data?.results ?? []).map(
    (one: { id: string }) => one.id,
  );
  const origin = lat !== undefined && lng !== undefined ? { lat, lng } : NAIROBI_CENTER;
  const hasOwnLocation = lat !== undefined && lng !== undefined;

  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // Everything the API itself cannot narrow by is read off the rows instead,
  // so the number on the button and the list behind it always agree
  const experienceCount = (preview?.experiences ?? []).filter(
    (experience) =>
      matchesShapes(experience, draft.experienceShapes) &&
      matchesQuickDate(experience, draft.quickDate) &&
      matchesTimeOfDay(experience, draft.timeOfDay) &&
      matchesInterests(experience, draft.interests) &&
      matchesDistance(experience, draft.distance, origin) &&
      matchesPrice(experience, draft) &&
      matchesDuration(experience, draft.durationBand) &&
      matchesYourCommunities(experience, draft.yourCommunitiesOnly, followedCommunityIds) &&
      (!draft.happeningNow || isOngoing(experience)),
  ).length;
  // Places carry no other client-only narrowing, so the API total stands
  // unless a distance band is actually picked
  const placeCount = draft.distance
    ? (preview?.places ?? []).filter((place) => matchesDistance(place, draft.distance, origin))
        .length
    : (preview?.counts.place ?? 0);
  const countFor = (type: ResultType) =>
    type === 'experiences'
      ? experienceCount
      : type === 'places'
        ? placeCount
        : experienceCount + placeCount;

  const showsExperiences = draft.type === 'all' || draft.type === 'experiences';
  const showsPlaces = draft.type === 'all' || draft.type === 'places';
  const total = countFor(draft.type);

  const toggleShape = (shape: string) =>
    set(
      'experienceShapes',
      draft.experienceShapes.includes(shape)
        ? draft.experienceShapes.filter((one) => one !== shape)
        : [...draft.experienceShapes, shape],
    );

  const toggleTimeOfDay = (band: SearchFilters['timeOfDay'][number]) =>
    set(
      'timeOfDay',
      draft.timeOfDay.includes(band)
        ? draft.timeOfDay.filter((one) => one !== band)
        : [...draft.timeOfDay, band],
    );

  const toggleInterest = (id: string) =>
    set(
      'interests',
      draft.interests.includes(id)
        ? draft.interests.filter((one) => one !== id)
        : [...draft.interests, id],
    );

  // Any time clears both; a quick pick clears the exact date, and picking an
  // exact date clears the quick pick - only one of the two is ever live
  const pickAnyTime = () => {
    setIsPickingDate(false);
    setDraft((current) => ({ ...current, quickDate: undefined, date: undefined }));
  };

  const pickQuickDate = (value: SearchFilters['quickDate']) => {
    setIsPickingDate(false);
    setDraft((current) => ({ ...current, quickDate: value, date: undefined }));
  };

  const pickExactDate = (value: string | undefined) => {
    setDraft((current) => ({ ...current, date: value, quickDate: undefined }));
  };

  const pickPrice = (mode: 'any' | 'free' | 'paid') =>
    setDraft((current) => ({ ...current, freeOnly: mode === 'free', paidOnly: mode === 'paid' }));

  const changePriceRange = (min: number, max: number) =>
    setDraft((current) => ({
      ...current,
      priceMin: min === 0 ? undefined : min,
      priceMax: max >= PRICE_CEILING ? undefined : max,
    }));

  const visibleInterests = showAllInterests
    ? interests
    : interests.slice(0, INITIAL_INTERESTS_SHOWN);

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>

      <PopoverContent
        align="center"
        sideOffset={8}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="z-50 flex max-h-[80vh] w-[calc(100vw-2rem)] max-w-[900px] flex-col gap-0 overflow-hidden rounded-3xl border-gray-100 p-0 shadow-xl"
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-surface-muted px-6 py-4">
          <p className="text-xl font-bold text-brand-ink">Filters</p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-brand-ink"
          >
            <IconComponent iconName="Cancel01Icon" size={18} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Section
            icon="Search01Icon"
            title="Looking for"
            hint="The filters below follow your pick"
          >
            <div className="flex flex-wrap gap-3">
              {RESULT_TYPES.filter((one) => one.value !== 'communities').map((option) => {
                const isOn = draft.type === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => set('type', option.value)}
                    className={cn(
                      'inline-flex h-14 items-center gap-2.5 rounded-full px-6 text-[17px] transition-colors',
                      isOn
                        ? 'bg-surface-brand font-semibold text-brand'
                        : 'bg-surface font-medium text-brand-ink hover:brightness-[0.97]',
                    )}
                  >
                    <IconComponent
                      iconName={
                        option.value === 'places'
                          ? 'Location01Icon'
                          : option.value === 'experiences'
                            ? 'Ticket01Icon'
                            : 'Compass01Icon'
                      }
                      size={20}
                      color="currentColor"
                      className={isOn ? 'text-brand' : 'text-ink-muted'}
                    />
                    {option.label}
                    <span className={cn('font-semibold', isOn ? 'text-brand' : 'text-ink-muted')}>
                      {countFor(option.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {showsExperiences && (
            <Section icon="Ticket01Icon" title="Experience type" hint="Pick one or more">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EXPERIENCE_SHAPES.map((shape) => (
                  <ToggleCard
                    key={shape.value}
                    icon={shape.icon}
                    label={shape.label}
                    description={shape.description}
                    isOn={draft.experienceShapes.includes(shape.value)}
                    onToggle={() => toggleShape(shape.value)}
                  />
                ))}
              </div>
            </Section>
          )}

          {showsExperiences && (
            <Section icon="Calendar03Icon" title="When" hint="Days with something on">
              <div className="flex flex-wrap gap-2.5">
                <Pill isOn={!draft.quickDate && !isPickingDate} onClick={pickAnyTime}>
                  Any time
                </Pill>

                {QUICK_DATES.map((option) => (
                  <Pill
                    key={option.value}
                    isOn={draft.quickDate === option.value}
                    onClick={() => pickQuickDate(option.value)}
                  >
                    {option.label}
                  </Pill>
                ))}

                <Pill isOn={isPickingDate} onClick={() => setIsPickingDate(true)}>
                  <IconComponent iconName="Calendar03Icon" size={16} color="currentColor" />
                  Pick dates
                </Pill>
              </div>

              {isPickingDate && (
                <div className="mt-3 max-w-xs">
                  <DatePicker
                    value={draft.date}
                    onChange={pickExactDate}
                    placeholder="Choose a date"
                  />
                </div>
              )}

              <div className="mt-5">
                <p className="text-[13px] font-semibold text-ink-muted">
                  Time of day by start time
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {TIME_OF_DAY.map((band) => (
                    <ToggleCard
                      key={band.value}
                      icon={band.icon}
                      label={band.label}
                      description={band.description}
                      isOn={draft.timeOfDay.includes(band.value)}
                      onToggle={() => toggleTimeOfDay(band.value)}
                    />
                  ))}
                </div>
              </div>
            </Section>
          )}

          <Section
            icon="Location01Icon"
            title="Where"
            hint="Where you are, or where you are headed"
          >
            {cities.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-ink-muted">City</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {cities.map((city) => {
                    const isOn = draft.city === city.id;
                    const image = categoryImageOf(city);

                    return (
                      <button
                        key={city.id}
                        type="button"
                        aria-pressed={isOn}
                        onClick={() => set('city', isOn ? undefined : city.id)}
                        className={cn(
                          'inline-flex h-11 items-center gap-2 rounded-full py-1 pl-1 pr-4 text-[14px] font-semibold transition-colors',
                          city.placesCount === 0 && 'opacity-50',
                          isOn
                            ? 'bg-surface-brand text-brand'
                            : 'bg-surface text-brand-ink hover:brightness-[0.97]',
                        )}
                      >
                        <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-surface-muted">
                          {image && (
                            // eslint-disable-next-line @next/next/no-img-element -- a small round chip thumbnail, not worth next/image's overhead here
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                        {city.name}
                        <span className={isOn ? 'text-brand' : 'text-ink-muted'}>
                          {city.placesCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5">
              <p className="text-[13px] font-semibold text-ink-muted">
                Area in and around {cities.find((one) => one.id === draft.city)?.name ?? 'Nairobi'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {AREA_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    disabled
                    aria-disabled="true"
                    tabIndex={-1}
                    className="h-11 cursor-not-allowed rounded-full bg-surface px-4 text-[13.5px] font-semibold text-ink-subtle opacity-50"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[13px] font-semibold text-ink-muted">
                Distance measured from {hasOwnLocation ? 'your location' : 'central Nairobi'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Pill isOn={!draft.distance} onClick={() => set('distance', undefined)}>
                  Any distance
                </Pill>
                {DISTANCE_BANDS.map((band) => (
                  <Pill
                    key={band.value}
                    isOn={draft.distance === band.value}
                    onClick={() => set('distance', band.value)}
                  >
                    {band.label}
                  </Pill>
                ))}
              </div>

              <button
                type="button"
                onClick={requestLocation}
                className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline"
              >
                <IconComponent iconName="GpsSignal01Icon" size={17} color="currentColor" />
                Use my location
              </button>
            </div>
          </Section>

          <Section icon="Tag01Icon" title="Price" hint="Per person">
            <div className="flex flex-wrap gap-2.5">
              <Pill isOn={!draft.freeOnly && !draft.paidOnly} onClick={() => pickPrice('any')}>
                Any price
              </Pill>
              <Pill isOn={draft.freeOnly} onClick={() => pickPrice('free')}>
                Free
              </Pill>
              <Pill isOn={draft.paidOnly} onClick={() => pickPrice('paid')}>
                Paid
              </Pill>
            </div>

            <div className="mt-5 max-w-sm">
              <PriceRangeSlider
                min={draft.priceMin ?? 0}
                max={draft.priceMax ?? PRICE_CEILING}
                onChange={changePriceRange}
              />
            </div>
          </Section>

          {showsExperiences && (
            <Section icon="Clock01Icon" title="Availability" hint="Right now, and how you book">
              <div className="grid gap-3 sm:grid-cols-3">
                <ToggleCard
                  icon="FlashIcon"
                  label="Happening now"
                  description="Already started, still running"
                  isOn={draft.happeningNow}
                  onToggle={() => set('happeningNow', !draft.happeningNow)}
                />
                <ToggleCard
                  icon="Ticket01Icon"
                  label="Spots left"
                  description="Hide sold out experiences"
                  isOn={draft.availableOnly}
                  onToggle={() => set('availableOnly', !draft.availableOnly)}
                />
                <ToggleCard
                  icon="RunningShoesIcon"
                  label="No booking needed"
                  description="Experiences you can just turn up to"
                  isOn={false}
                  onToggle={() => {}}
                  disabled
                />
              </div>
            </Section>
          )}

          {interests.length > 0 && (
            <Section icon="SparklesIcon" title="Interests" hint="Pick as many as you like">
              <div className="flex flex-wrap gap-2.5">
                {visibleInterests.map((interest) => (
                  <Pill
                    key={interest.id}
                    isOn={draft.interests.includes(interest.id)}
                    onClick={() => toggleInterest(interest.id)}
                  >
                    <IconComponent
                      iconName={interest.icon}
                      size={16}
                      color="currentColor"
                      className={
                        draft.interests.includes(interest.id) ? 'text-brand' : 'text-ink-muted'
                      }
                    />
                    {interest.name}
                  </Pill>
                ))}
              </div>

              {interests.length > INITIAL_INTERESTS_SHOWN && (
                <button
                  type="button"
                  onClick={() => setShowAllInterests((current) => !current)}
                  className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline"
                >
                  {showAllInterests
                    ? 'Show fewer interests'
                    : `Show all ${interests.length} interests`}
                  <IconComponent
                    iconName={showAllInterests ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
                    size={16}
                    color="currentColor"
                  />
                </button>
              )}
            </Section>
          )}

          {showsExperiences && (
            <Section icon="HourglassIcon" title="Duration" hint="How long it runs">
              <div className="flex flex-wrap gap-2.5">
                <Pill isOn={!draft.durationBand} onClick={() => set('durationBand', undefined)}>
                  Any length
                </Pill>
                {DURATION_BANDS.map((band) => (
                  <Pill
                    key={band.value}
                    isOn={draft.durationBand === band.value}
                    onClick={() => set('durationBand', band.value)}
                  >
                    {band.label}
                  </Pill>
                ))}
              </div>
            </Section>
          )}

          {showsExperiences && (
            <Section icon="UserGroupIcon" title="Organised by" hint="Who is running it">
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  icon="UserGroup03Icon"
                  label="Your communities"
                  description="Run by communities you joined"
                  isOn={draft.yourCommunitiesOnly}
                  onToggle={() => set('yourCommunitiesOnly', !draft.yourCommunitiesOnly)}
                />
                <ToggleCard
                  icon="UserStar01Icon"
                  label="Guided tours"
                  description="Led by a verified tour guide"
                  isOn={draft.guidedToursOnly}
                  onToggle={() => set('guidedToursOnly', !draft.guidedToursOnly)}
                />
              </div>
            </Section>
          )}

          {showsPlaces && (
            <Section icon="WheelchairIcon" title="Accessibility" hint="As listed by each place">
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  icon="WheelchairIcon"
                  label="Step-free access"
                  description="No steps at the entrance"
                  isOn={false}
                  onToggle={() => {}}
                  disabled
                />
                <ToggleCard
                  icon="ParkingAreaCircleIcon"
                  label="Parking"
                  description="Parking listed by the place"
                  isOn={false}
                  onToggle={() => {}}
                  disabled
                />
              </div>
            </Section>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-surface-muted px-6 py-4">
          <button
            type="button"
            onClick={() => setDraft(clearedFilters(draft))}
            className="text-base font-medium text-ink-muted transition-colors hover:text-brand-ink"
          >
            Clear all
          </button>

          <Button
            type="button"
            variant="gradient"
            onClick={() => onApply(draft)}
            className="h-14 rounded-full px-10 text-base font-semibold"
          >
            Show all {total}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
