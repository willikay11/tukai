'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSearchResults } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { PlaceCategory } from '@/types/placeCategory';
import { ResultType, SearchFilters } from '@/types/search';

import { RESULT_TYPES, clearedFilters } from './filters';
import { EXPERIENCE_SHAPES, matchesShapes } from './shapes';

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
}: {
  icon: string;
  label: string;
  description: string;
  isOn: boolean;
  onToggle: () => void;
}) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-2xl p-4 transition-colors',
      isOn ? 'bg-surface-brand' : 'bg-surface',
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

    <Switch checked={isOn} aria-label={label} onCheckedChange={onToggle} className="mt-0.5" />
  </div>
);

/**
 * Narrowing a search.
 *
 * ⚠️ Only what can actually be answered. The canvas also offers time of day,
 * duration, a distance radius, price, open now, drop-in, reservable, offers,
 * step-free access, parking and a minimum rating - no endpoint takes any of
 * them, so they are absent rather than present and inert.
 */
export const FiltersDialog = ({
  filters,
  isOpen,
  onClose,
  onApply,
}: {
  filters: SearchFilters;
  isOpen: boolean;
  onClose: () => void;
  onApply: (next: SearchFilters) => void;
}) => {
  const [draft, setDraft] = useState(filters);

  // The dialog stays mounted between openings, so the controls follow what is
  // in force when it opens rather than what was last abandoned
  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  const { data: categoriesResponse } = usePlaceCategories({ pageSize: 100 }, isOpen);
  // Counted against the draft, so the numbers follow the controls as they move
  const { data: preview } = useSearchResults({ ...draft, type: 'all' }, isOpen);

  const categories: PlaceCategory[] = categoriesResponse?.data?.results ?? [];
  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // The shapes the API cannot narrow by are counted off the rows, so the
  // number on the button and the list behind it always agree
  const experienceCount = (preview?.experiences ?? []).filter((experience) =>
    matchesShapes(experience, draft.experienceShapes),
  ).length;
  const placeCount = preview?.counts.place ?? 0;
  const countFor = (type: ResultType) =>
    type === 'experiences'
      ? experienceCount
      : type === 'places'
        ? placeCount
        : experienceCount + placeCount;

  const showsExperiences = draft.type === 'all' || draft.type === 'experiences';
  const total = countFor(draft.type);

  const toggleShape = (shape: string) =>
    set(
      'experienceShapes',
      draft.experienceShapes.includes(shape)
        ? draft.experienceShapes.filter((one) => one !== shape)
        : [...draft.experienceShapes, shape],
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-[900px] gap-0 overflow-hidden rounded-3xl p-0 md:max-w-[900px]">
        <div className="flex items-center justify-between gap-4 border-b border-surface-muted px-6 py-4">
          <DialogTitle className="text-xl font-bold text-brand-ink">Filters</DialogTitle>
        </div>

        <div className="overflow-y-auto">
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
              <div className="max-w-xs">
                <DatePicker
                  value={draft.date}
                  onChange={(value) => set('date', value)}
                  placeholder="Any day"
                />
              </div>
            </Section>
          )}

          {categories.length > 0 && (
            <Section icon="Tag01Icon" title="Category" hint="One at a time">
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 12).map((category) => {
                  const isOn = draft.category === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => set('category', isOn ? undefined : category.id)}
                      className={cn(
                        'h-11 rounded-full px-4 text-[13.5px] font-semibold transition-colors',
                        isOn ? 'bg-surface-brand text-brand' : 'bg-surface text-gray-900',
                      )}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-surface-muted px-6 py-4">
          <button
            type="button"
            onClick={() => setDraft(clearedFilters(draft))}
            className="text-base font-medium text-ink-muted transition-colors hover:text-brand-ink"
          >
            Clear all
          </button>

          <Button
            type="button"
            onClick={() => onApply(draft)}
            className="h-14 rounded-full bg-brand-deep px-10 text-base font-semibold text-white hover:bg-brand-deep/90"
          >
            Show all {total}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
