import { ReactNode, useState } from 'react';

import { Input as I } from '@headlessui/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/react-pro';
import clsx from 'clsx';

function ViewPassword({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return visible ? (
    <ViewIcon size={20} variant="twotone" className="cursor-pointer" onClick={onClick} />
  ) : (
    <ViewOffIcon size={20} variant="twotone" className="cursor-pointer" onClick={onClick} />
  );
}

export default function Input({
  placeholder,
  type,
  icon,
  name,
  defaultValue,
  error,
  refs,
}: {
  placeholder: string;
  type: 'text' | 'password';
  icon: ReactNode;
  name: string;
  defaultValue?: string;
  error?: string;
  refs?: any;
}) {
  const [viewPassword, setViewPassword] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <div
        className={clsx(
          'inline-flex h-[3.375rem] w-full items-center rounded-[8px] border-[1px] px-4',
          {
            'hover:border-primary focus:border-primary': !error,
            'border-red-400': error,
          },
        )}
      >
        <div className="mr-2 text-gray-500">{icon}</div>
        <I
          className="w-full text-xs text-gray-500 font-medium outline-0 placeholder:text-xs"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          type={viewPassword ? 'text' : type}
          {...refs}
        />
        {type === 'password' ? (
          <ViewPassword visible={viewPassword} onClick={() => setViewPassword(!viewPassword)} />
        ) : null}
      </div>
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
