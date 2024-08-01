import { ReactNode } from 'react';
import clsx from 'clsx';

export default function Button({
  children,
  onClick,
  type = 'primary',
  size = 'normal',
  block = false,
}: {
  children: ReactNode;
  onClick: () => void;
  type?: 'primary' | 'blue';
  size?: 'small' | 'normal' | 'large';
  block?: boolean;
}) {
  return (
    <button
      className={clsx(`rounded-[8px] text-xs text-white`, {
        'bg-primary': type === 'primary',
        'bg-blue-500': type === 'blue',
        'h-[3.375rem]': size === 'normal',
        'h-8': size === 'small',
        'w-full': block,
        'px-3': !block,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
