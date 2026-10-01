'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { PlaceCategory } from '@/types/placeCategory';

import {
  EXPERIENCE_TYPES,
  RESULT_TYPES,
  SearchFilters,
  clearedFilters,
  countActive,
} from './filters';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2.5">
    <span className="text-15 font-semibold text-gray-900">{title}</span>
    {children}
  </div>
);

const Choice = ({
  label,
  isOn,
  onClick,
}: {
  label: string;
  isOn: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={isOn}
    onClick={onClick}
    className={cn(
      'h-11 rounded-full px-4 text-[13.5px] font-semibold transition-colors',
      isOn ? 'bg-surface-brand text-brand ring-1 ring-brand' : 'bg-surface text-gray-900',
    )}
  >
    {label}
  </button>
);

/**
 * Narrowing a search.
 *
 * ⚠️ Only what the API can filter on. The canvas also offers time of day,
 * duration, a distance radius, price, open now, drop-in, reservable, offers,
 * step-free access, parking and a minimum rating — none of which any endpoint
 * accepts, so they are absent rather than present and ignored.
 */
export const EditFiltersDrawer = ({
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
  const { data: categoriesResponse } = usePlaceCategories({ pageSize: 100 }, isOpen);

  // The drawer stays mounted between openings, so the controls follow whatever
  // is in force when it opens rather than what was last abandoned
  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  const categories: PlaceCategory[] = categoriesResponse?.data?.results ?? [];
  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const showsExperienceFilters = draft.type === 'all' || draft.type === 'experiences';
  const showsPlaceFilters = draft.type === 'all' || draft.type === 'places';

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
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Filters</h2>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <Section title="What are you looking for?">
            <div className="flex flex-wrap gap-2">
              {RESULT_TYPES.map((option) => (
                <Choice
                  key={option.value}
                  label={option.label}
                  isOn={draft.type === option.value}
                  onClick={() => set('type', option.value)}
                />
              ))}
            </div>
          </Section>

          {categories.length > 0 && (
            <Section title="Category">
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 12).map((category) => (
                  <Choice
                    key={category.id}
                    label={category.name}
                    isOn={draft.category === category.id}
                    onClick={() =>
                      set('category', draft.category === category.id ? undefined : category.id)
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {showsExperienceFilters && (
            <>
              <Section title="On a day">
                <DatePicker
                  value={draft.date}
                  onChange={(value) => set('date', value)}
                  placeholder="Any day"
                />
              </Section>

              <Section title="Kind of experience">
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_TYPES.map((option) => (
                    <Choice
                      key={option.value}
                      label={option.label}
                      isOn={draft.experienceType === option.value}
                      onClick={() =>
                        set(
                          'experienceType',
                          draft.experienceType === option.value ? undefined : option.value,
                        )
                      }
                    />
                  ))}
                </div>
              </Section>

              <Section title="Price and availability">
                <div className="flex flex-wrap gap-2">
                  <Choice
                    label="Free"
                    isOn={draft.freeOnly}
                    onClick={() => set('freeOnly', !draft.freeOnly)}
                  />
                  <Choice
                    label="Has spots"
                    isOn={draft.availableOnly}
                    onClick={() => set('availableOnly', !draft.availableOnly)}
                  />
                </div>
              </Section>
            </>
          )}

          {showsPlaceFilters && (
            <Section title="Order places by">
              <div className="flex flex-wrap gap-2">
                <Choice
                  label="Most relevant"
                  isOn={!draft.popularFirst}
                  onClick={() => set('popularFirst', false)}
                />
                <Choice
                  label="Most popular"
                  isOn={draft.popularFirst}
                  onClick={() => set('popularFirst', true)}
                />
              </div>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraft(clearedFilters(draft))}
            className="text-danger"
          >
            Clear all
          </Button>
          <Button
            type="button"
            variant="lime"
            onClick={() => onApply(draft)}
            className="rounded-full px-6"
          >
            {countActive(draft) > 0 ? `Show results (${countActive(draft)})` : 'Show results'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
