import clsx from 'clsx';
import { Input as I } from '@headlessui/react';
import { useState } from 'react';

const Input = ({
  fieldIndex,
  refs,
  placeholder,
  defaultValue,
  error,
}: {
  fieldIndex: number;
  refs?: any;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
}) => {
  const [value, setValue] = useState<string | undefined>(undefined);

  const goToNext = () => {
    if (fieldIndex <= 4) {
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
            goToNext();
          } else {
            goToPrevious();
          }
        }}
        {...refs}
      />
    </div>
  );
};
export default function OtpInput({ error }: { error?: string }) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 gap-2">
        <Input fieldIndex={1} error={error} />
        <Input fieldIndex={2} error={error} />
        <Input fieldIndex={3} error={error} />
        <Input fieldIndex={4} error={error} />
      </div>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
