'use client';

import sanitizeHtml from 'sanitize-html';

import IconComponent from '@/app/components/iconComponent';

export interface ReviewInfoSectionProps {
  title: string;
  description: string;
  variant: 'included' | 'excluded';
}

export default function ReviewInfoSection({ title, description, variant }: ReviewInfoSectionProps) {
  if (!description?.trim()) {
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
          iconName={isIncluded ? 'ThumbsUpIcon' : 'ThumbsDownIcon'}
          size={16}
          color={iconColor}
        />
        <h3 className="text-xs font-semibold text-gray-800">{title}</h3>
      </div>
      <div
        className="mt-2 text-xs text-gray-700 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
    </div>
  );
}
