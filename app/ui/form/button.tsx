import { ReactNode } from 'react';
import clsx from 'clsx';
import Loader from '@/app/ui/form/loader';

export default function Button({
  children,
  htmlType = 'button',
  onClick,
  type = 'primary',
  size = 'normal',
  block = false,
  loading = false,
}: {
  children: ReactNode;
  htmlType?: 'submit' | 'reset' | 'button';
  onClick?: () => void;
  type?: 'primary' | 'blue';
  size?: 'small' | 'normal' | 'large';
  block?: boolean;
  loading?: boolean;
}) {
  let content = children;

  if (loading) {
    content = (
      <div
        aria-label="Loading..."
        role="status"
        className="flex items-center justify-center space-x-2"
      >
        <Loader />
        {children}
      </div>
    );
  }
  return (
    <button
      disabled={loading}
      className={clsx(`rounded-[8px] text-xs text-white`, {
        'bg-primary': type === 'primary',
        'bg-blue-500': type === 'blue',
        'h-[3.375rem]': size === 'normal',
        'h-8': size === 'small',
        'w-full': block,
        'px-3': !block,
      })}
      onClick={() => onClick?.()}
      type={htmlType}
    >
      {content}
    </button>
  );
}
