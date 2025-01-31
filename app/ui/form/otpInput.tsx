import clsx from 'clsx';
import { Input as I } from '@headlessui/react';
import { useEffect, useState } from 'react';

const Input = ({
  fieldIndex,
  onChange,
  refs,
  placeholder,
  defaultValue,
  error,
}: {
  fieldIndex: number;
  onChange: (index: number, val: string | undefined) => void;
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
export default function OtpInput({
  onComplete,
  error,
}: {
  onComplete: (token: string) => void;
  error?: string;
}) {
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
    if (otp?.length === 4) {
      onComplete(otp);
    }
  }, [otp]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 gap-2">
        <Input fieldIndex={1} error={error} onChange={(index, val) => update(index, val)} />
        <Input fieldIndex={2} error={error} onChange={(index, val) => update(index, val)} />
        <Input fieldIndex={3} error={error} onChange={(index, val) => update(index, val)} />
        <Input fieldIndex={4} error={error} onChange={(index, val) => update(index, val)} />
      </div>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
