'use client';

import { FilterPill } from '@/app/shared/components/Filters';
import { Interest } from '@/types/interest';

/**
 * The "View by Type" row: the interest categories a community can be filed
 * under, as a single-choice filter over the list below it.
 *
 * The categories are the same `/accounts/interests/` set the create flows pick
 * from — there is no separate community taxonomy — so a pill here maps
 * straight onto the list endpoint's `category` parameter.
 *
 * The chip is the shared {@link FilterPill}, the same one the category bar over
 * Explore and Discover uses — a filter looks the same wherever it appears.
 */
export const CommunityTypeFilter = ({
  categories,
  selectedId,
  onSelect,
  isLoading = false,
}: {
  categories: Interest[];
  /** `null` is "everything" — the row opens with nothing narrowed. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
}) => (
  <section>
    <h2 className="text-xl font-bold text-gray-900">View by Type</h2>

    <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-32 flex-shrink-0 animate-pulse rounded-full bg-gray-100"
            />
          ))
        : categories.map((category) => (
            <FilterPill
              key={category.id}
              label={category.name}
              icon={category.icon}
              isSelected={selectedId === category.id}
              className="flex-shrink-0"
              // Pressing the chosen one again clears the filter, which is the
              // only way back to everything without a separate "All" pill
              onClick={() => onSelect(selectedId === category.id ? null : category.id)}
            />
          ))}
    </div>
  </section>
);
