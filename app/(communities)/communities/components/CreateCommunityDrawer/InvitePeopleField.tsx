'use client';

import { useState } from 'react';

import { z } from 'zod';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';

import type { InvitedPerson } from './useCreateCommunityDrawer';

const emailSchema = z.string().email();

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

interface InvitePeopleFieldProps {
  invited: InvitedPerson[];
  query: string;
  onQueryChange: (value: string) => void;
  results: InvitedPerson[];
  isSearching: boolean;
  onAdd: (person: InvitedPerson) => void;
  onRemove: (id: string) => void;
}

export const InvitePeopleField = ({
  invited,
  query,
  onQueryChange,
  results,
  isSearching,
  onAdd,
  onRemove,
}: InvitePeopleFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const trimmed = query.trim();
  const isValidEmail = emailSchema.safeParse(trimmed).success;
  const alreadyInvited = (email: string) =>
    invited.some((person) => person.email?.toLowerCase() === email.toLowerCase());

  const suggestions = results.slice(0, 4);
  const showPanel = isFocused && trimmed.length > 0;
  const showNoMatch =
    showPanel && trimmed.length >= 2 && suggestions.length === 0 && !isSearching && !isValidEmail;

  const addEmail = () => {
    if (!isValidEmail || alreadyInvited(trimmed)) return;

    onAdd({
      id: `email-${Date.now()}`,
      name: trimmed,
      email: trimmed,
    });
    onQueryChange('');
  };

  const handleSelect = (person: InvitedPerson) => {
    onAdd(person);
    onQueryChange('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !trimmed) return;
    event.preventDefault();

    const [firstMatch] = suggestions;
    if (firstMatch) {
      handleSelect(firstMatch);
      return;
    }

    addEmail();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          type="text"
          aria-label="Search by name or add their email"
          placeholder="Search by name or add their email"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={handleKeyDown}
          containerClassName="h-14 rounded-xl"
          suffixIcon={<IconComponent iconName="Search01Icon" size={20} color="currentColor" />}
        />

        {showPanel && (suggestions.length > 0 || isValidEmail) && (
          <div className="absolute z-10 mt-1 flex w-full flex-col gap-0.5 rounded-xl bg-white p-1.5 shadow-[0_10px_28px_rgba(1,51,52,.14)]">
            {suggestions.map((person) => (
              <button
                key={person.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(person)}
                className="flex min-h-[52px] items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left hover:bg-surface"
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

                <span className="flex min-w-0 flex-col gap-px">
                  <span className="truncate text-[15px] font-medium text-gray-800">
                    {person.name}
                  </span>
                  <span className="text-13 text-ink-muted">On Tukai</span>
                </span>
              </button>
            ))}

            {isValidEmail && !alreadyInvited(trimmed) && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={addEmail}
                className="flex min-h-[52px] items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left hover:bg-surface"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-brand">
                  <IconComponent iconName="Mail01Icon" size={18} color="currentColor" />
                </span>
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="truncate text-[15px] font-medium text-gray-800">
                    {trimmed}
                  </span>
                  <span className="text-13 text-ink-muted">Invite by email</span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {showNoMatch && (
        <p className="text-sm text-ink-muted">
          No one on Tukai matches &ldquo;{trimmed}&rdquo;. Add their email address instead.
        </p>
      )}

      {invited.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {invited.map((person) => (
            <span
              key={person.id}
              className="inline-flex h-[52px] max-w-full items-center gap-2 rounded-full bg-surface py-0 pl-1.5 pr-0.5"
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

              <span className="max-w-[160px] truncate text-[15px] text-gray-800">
                {person.name}
              </span>

              <button
                type="button"
                onClick={() => onRemove(person.id)}
                aria-label={`Remove ${person.name}`}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-gray-800"
              >
                <IconComponent iconName="CancelCircleIcon" size={22} color="currentColor" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
