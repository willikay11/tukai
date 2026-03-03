'use client';

import IconComponent from '@/app/components/iconComponent';

export interface ReviewInfoSectionProps {
  title: string;
  items: string[];
  variant: 'included' | 'excluded';
}

export default function ReviewInfoSection({
  title,
  items,
  variant,
}: ReviewInfoSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const isIncluded = variant === 'included';
  const iconColor = isIncluded ? '#10B981' : '#EF4444';
  const bgColor = isIncluded ? 'bg-emerald-50' : 'bg-red-50';
  const borderColor = isIncluded ? 'border-emerald-200' : 'border-red-200';

  return (
    <div className={`mt-4 rounded-lg border ${borderColor} ${bgColor} p-3`}>
      <div className="flex items-center gap-2">
        <IconComponent
          iconName={isIncluded ? 'CheckmarkCircle02Icon' : 'AlertCircleIcon'}
          size={16}
          color={iconColor}
        />
        <h3 className="text-xs font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
