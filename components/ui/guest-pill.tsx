'use client';

import { IconComponent } from '@/app/components/iconComponent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GuestPillProps {
  name: string;
  image?: string;
  onRemove?: () => void;
  className?: string;
  nameClassName?: string;
}

export function GuestPill({
  name,
  image,
  onRemove,
  className = '',
  nameClassName = 'max-w-[112px] truncate text-xs text-gray-700',
}: GuestPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-2 ${className}`}
    >
      <Avatar className="h-6 w-6">
        {image ? <AvatarImage src={image} alt={name} /> : null}
        <AvatarFallback className="bg-gray-200 text-gray-500">
          <IconComponent iconName="UserIcon" size={14} color="gray" />
        </AvatarFallback>
      </Avatar>

      <span className={nameClassName}>{name}</span>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 hover:bg-gray-500"
        >
          <IconComponent iconName="Cancel01Icon" size={12} color="white" />
        </button>
      ) : null}
    </div>
  );
}
