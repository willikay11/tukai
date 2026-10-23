'use client';

import { useEffect, useState } from 'react';

import { Input as I } from '@headlessui/react';
import clsx from 'clsx';

// Tailwind's scanner needs the literal class name in source, so a
// dynamically built `grid-cols-${length}` string wouldn't be picked up -
// every length an OtpInput is actually asked for goes here.
const GRID_COLS: Record<number, string> = {
  4: 'grid-cols-4',
  6: 'grid-cols-6',
};

const Input = ({
  fieldIndex,
  length,
  onChange,
  refs,
  placeholder,
  defaultValue,
  error,
}: {
  fieldIndex: number;
  length: number;
  onChange: (index: number, val: string | undefined) => void;
  refs?: any;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
}) => {
  const [value, setValue] = useState<string | undefined>(undefined);

  const goToNext = () => {
    if (fieldIndex <= length) {
      const nextField = document.querySelector(`input[name=field-${fieldIndex + 1}]`);

      if (nextField !== null) {
        nextField.focus();
      }
    }
  };
  const goToPrevious = () => {
    setValue(undefined);
    if (fieldIndex >= 1) {
      const prevField = document.querySelector(`input[name=field-${fieldIndex - 1}]`);

      if (prevField !== null) {
        prevField.focus();
      }
    }
  };

  return (
    <div
      className={clsx(
        'inline-flex h-[3.375rem] w-full items-center rounded-[10px] border-[1px] px-4',
        {
          'hover:border-primary focus:border-primary': !error,
          'border-red-400': error,
        },
      )}
    >
      <I
        name={`field-${fieldIndex}`}
        value={value}
        className="w-full text-center text-xl text-gray-500 outline-0 placeholder:text-xs"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={1}
        type="number"
        onChange={(event) => {
          if (event.target.value) {
            let newValue = event.target.value;

            if (event.target.value.length > 1) {
              newValue = newValue.slice(0, 1);
            }
            setValue(newValue);
            onChange(fieldIndex - 1, newValue);
            goToNext();
          } else {
            onChange(fieldIndex - 1, undefined);
            goToPrevious();
          }
        }}
        {...refs}
      />
    </div>
  );
};
export const OtpInput = ({
  length = 4,
  onComplete,
  error,
}: {
  /** How many digits the code is. Defaults to 4 for existing callers. */
  length?: number;
  onComplete: (token: string) => void;
  error?: string;
}) => {
  const [otp, setOtp] = useState<string | undefined>();
  const update = (index: number, val: string | undefined) => {
    if (typeof val === 'string') {
      setOtp((prevState) => {
        if (prevState) {
          return `${prevState}${val}`;
        }
        return val;
      });
    } else {
      setOtp((prevState) => prevState?.slice(0, index));
    }
  };

  useEffect(() => {
    if (otp?.length === length) {
      onComplete(otp);
    }
  }, [otp, length]);

  return (
    <div className="flex flex-col">
      <div
        className={clsx('grid gap-2', GRID_COLS[length])}
        style={
          GRID_COLS[length]
            ? undefined
            : { gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }
        }
      >
        {Array.from({ length }, (_, i) => i + 1).map((fieldIndex) => (
          <Input
            key={fieldIndex}
            fieldIndex={fieldIndex}
            length={length}
            error={error}
            onChange={(index, val) => update(index, val)}
          />
        ))}
      </div>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
};
