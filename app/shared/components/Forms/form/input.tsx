'use client';

import { ReactNode, useState } from 'react';

import { ViewIcon, ViewOffIcon } from '@hugeicons/react-pro';

import { Input as BaseInput } from '@/components/ui/input';

function ViewPassword({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return visible ? (
    <ViewIcon size={20} variant="twotone" className="cursor-pointer" onClick={onClick} />
  ) : (
    <ViewOffIcon size={20} variant="twotone" className="cursor-pointer" onClick={onClick} />
  );
}

/**
 * A labelled field with an icon, an optional password reveal and an error
 * message. The field itself is the shared {@link BaseInput}, so it carries the
 * same border, radius, type and focus treatment as every other input.
 */
export const Input = ({
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
}) => {
  const [viewPassword, setViewPassword] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <BaseInput
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        type={viewPassword ? 'text' : type}
        icon={<div className="text-gray-500">{icon}</div>}
        suffixIcon={
          type === 'password' ? (
            <ViewPassword visible={viewPassword} onClick={() => setViewPassword(!viewPassword)} />
          ) : null
        }
        containerClassName={error ? 'border-red-400' : undefined}
        {...refs}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
};
