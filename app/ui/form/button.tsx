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
  type?: 'primary' | 'blue' | 'link';
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
        <Loader size={4} />
        {children}
      </div>
    );
  }
  return (
    <button
      disabled={loading}
      className={clsx(`inline-flex justify-center rounded-[8px] text-xs`, {
        'bg-primary text-white': type === 'primary',
        'bg-blue-500 text-white': type === 'blue',
        'bg-white text-primary': type === 'link',
        'py-5': size === 'normal',
        'py-2': size === 'small',
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
