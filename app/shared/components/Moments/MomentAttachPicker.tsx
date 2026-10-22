'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';

import type { AttachmentKind } from './useMomentComposer';
import { type MomentAttachOption, useMomentAttachSearch } from './useMomentAttachSearch';

const COPY: Record<AttachmentKind, { title: string; searchPlaceholder: string; emptyKind: string }> = {
  experience: {
    title: 'Attach an experience',
    searchPlaceholder: 'Search experiences',
    emptyKind: 'experiences',
  },
  community: {
    title: 'Attach a community',
    searchPlaceholder: 'Search your communities',
    emptyKind: 'communities',
  },
  place: {
    title: 'Attach a place',
    searchPlaceholder: 'Search places',
    emptyKind: 'places',
  },
};

/**
 * The picker one empty attach tile opens: search plus a list, inline below
 * the tile grid rather than a dialog. Picking a row attaches it and closes
 * the picker straight away - there is only room for one per kind.
 */
export const MomentAttachPicker = ({
  kind,
  onSelect,
  onClose,
}: {
  kind: AttachmentKind;
  onSelect: (option: MomentAttachOption) => void;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState('');
  const { options, total, isLoading, isSearching, hasNoCommunities } = useMomentAttachSearch(
    kind,
    query,
  );
  const copy = COPY[kind];

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-surface p-2 pt-2">
      <div className="flex items-center justify-between gap-2 pl-1">
        <span className="text-[15px] font-semibold text-gray-800">{copy.title}</span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-800 hover:bg-surface-brand"
        >
          <IconComponent iconName="Cancel01Icon" size={18} color="currentColor" />
        </button>
      </div>

      <div className="flex h-12 items-center gap-2.5 rounded-full bg-white px-4">
        <IconComponent iconName="Search01Icon" size={18} color="currentColor" className="text-ink-muted" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchPlaceholder}
          aria-label={copy.searchPlaceholder}
          autoFocus
          className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-ink-muted"
        />
      </div>

      <div
        role="listbox"
        aria-label={copy.title}
        className="flex flex-col gap-0.5"
      >
        {isLoading ? (
          <div className="flex flex-col gap-1 p-1">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-[60px] animate-pulse rounded-xl bg-white/70" />
            ))}
          </div>
        ) : hasNoCommunities ? (
          <p className="m-1 text-sm leading-relaxed text-ink-muted">
            Join a community to share moments there. Joining is instant.
          </p>
        ) : options.length === 0 ? (
          <p className="m-1 text-sm leading-relaxed text-ink-muted">
            Nothing matches &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => onSelect(option)}
              className="flex min-h-[60px] items-center gap-3 rounded-xl p-2 text-left hover:bg-white"
            >
              {option.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={option.thumb}
                  alt=""
                  className="h-11 w-11 flex-shrink-0 rounded-[10px] object-cover"
                />
              ) : (
                <span className="h-11 w-11 flex-shrink-0 rounded-[10px] bg-surface-brand" />
              )}

              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[15px] font-semibold text-gray-900">
                  {option.label}
                </span>
                {option.meta && (
                  <span className="truncate text-13 text-ink-muted">{option.meta}</span>
                )}
              </span>
            </button>
          ))
        )}

        {!isLoading && !isSearching && !hasNoCommunities && total > options.length && (
          <p className="m-1 text-13 text-ink-muted">
            Showing {options.length} of {total}. Search to find the rest.
          </p>
        )}
      </div>
    </div>
  );
};
