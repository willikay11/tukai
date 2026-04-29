import { ReactNode } from 'react';

import clsx from 'clsx';

import { Loader } from '@/app/components/form/loader';

export const Button = ({
  children,
  htmlType = 'button',
  onClick,
  type = 'primary',
  size = 'normal',
  block = false,
  loading = false,
  disabled = false,
}: {
  children: ReactNode;
  htmlType?: 'submit' | 'reset' | 'button';
  onClick?: () => void;
  type?: 'primary' | 'blue' | 'link';
  size?: 'small' | 'normal' | 'large';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) => {
  let content = children;

  if (loading) {
    content = (
      <div
        aria-label="Loading..."
        role="status"
        className="flex items-center justify-center space-x-2"
      >
        <Loader size="small" />
        {children}
      </div>
    );
  }
  return (
    <button
      disabled={loading || disabled}
      className={clsx(`inline-flex justify-center rounded-[8px] text-xs`, {
        'bg-primary font-medium text-white': type === 'primary',
        'bg-blue-500 text-white': type === 'blue',
        'bg-white px-0 py-0 text-primary': type === 'link',
        'py-5': size === 'normal' && type !== 'link',
        'py-2': size === 'small' && type !== 'link',
        'w-full': block,
        'px-3': !block && type !== 'link',
      })}
      onClick={() => onClick?.()}
      type={htmlType}
    >
      {content}
    </button>
  );
};
