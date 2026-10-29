'use client';

import { useState } from 'react';

const BOX_BASE =
  'box-border flex h-14 items-center justify-center rounded-xl border bg-white text-2xl font-bold tabular-nums text-ink-pill transition-colors';

// Tailwind needs the literal class name in source to keep it - a computed
// `grid-cols-${n}` string wouldn't survive the production build.
const GRID_COLS: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/**
 * A numeric code as boxes, with one real (invisible) input laid over all of
 * them so paste and autofill keep working - the boxes are decorative.
 * Shared by the 6-digit account-verification code (AU-04) and the 4-digit
 * password-reset code (AU-08), which only differ in how the digits group.
 */
export const DigitCodeInput = ({
  length,
  groups,
  value,
  onChange,
  error,
  busy,
  autoFocus,
  ariaLabel,
}: {
  length: number;
  /** Group sizes, left to right, must sum to `length` (e.g. [3, 3] or [4]). */
  groups: number[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  busy?: boolean;
  autoFocus?: boolean;
  ariaLabel: string;
}) => {
  const [focused, setFocused] = useState(false);
  const activeIndex = focused && !busy ? Math.min(value.length, length - 1) : -1;

  const boxClass = (i: number) => {
    if (error) return 'border-danger-deep';
    if (i === activeIndex) return 'border-brand shadow-[0_0_0_3px_#E8F1ED]';
    return 'border-line';
  };

  let cursor = 0;

  return (
    <div className="relative flex gap-3.5">
      {groups.map((groupSize, groupIndex) => {
        const indices = Array.from({ length: groupSize }, () => cursor++);
        return (
          <div
            key={groupIndex}
            className={`grid flex-1 gap-2 ${GRID_COLS[groupSize] ?? 'grid-cols-4'}`}
          >
            {indices.map((i) => (
              <span key={i} aria-hidden="true" className={`${BOX_BASE} ${boxClass(i)}`}>
                {value[i] ?? ''}
              </span>
            ))}
          </div>
        );
      })}

      <input
        type="text"
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        aria-label={ariaLabel}
        aria-invalid={!!error}
        readOnly={busy}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          const target = e.currentTarget;
          const n = target.value.length;
          target.setSelectionRange(n, n);
        }}
        className="absolute inset-0 m-0 h-full w-full cursor-text border-0 bg-transparent p-0 text-base opacity-0"
      />
    </div>
  );
};
