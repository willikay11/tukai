import { ReactNode, useState } from 'react';
import { Input as I } from '@headlessui/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/react-pro';

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
}: {
  placeholder: string;
  type: 'text' | 'password';
  icon: ReactNode;
}) {
  const [viewPassword, setViewPassword] = useState<boolean>(false);

  return (
    <div className="inline-flex h-[3.375rem] w-full items-center rounded-[8px] border-[1px] px-4 hover:border-primary focus:border-primary">
      <div className="mr-2 text-gray-500">{icon}</div>
      <I
        className="w-full text-xs text-gray-500 outline-0 placeholder:text-xs"
        placeholder={placeholder}
        type={viewPassword ? 'text' : type}
      />
      {type === 'password' ? (
        <ViewPassword visible={viewPassword} onClick={() => setViewPassword(!viewPassword)} />
      ) : null}
    </div>
  );
}
