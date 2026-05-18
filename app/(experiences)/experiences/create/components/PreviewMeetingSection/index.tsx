'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewMeetingSectionProps {
  meetingPoint: string | null;
  meetingTime: string | null;
  onEdit?: () => void;
}

export const PreviewMeetingSection = ({ meetingPoint, meetingTime, onEdit }: PreviewMeetingSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Meeting/Pick-up Point & Time</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className='text-gray-800' />
          </button>
        )}
      </div>
      {meetingPoint ? (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className='bg-gray-100 rounded-[12px] p-4'>
                <IconComponent iconName="Image02Icon" size={28} className="text-gray-600" />
              </div>
              <div className='flex flex-row items-center gap-2'>
                <p className="text-xs font-medium text-gray-800">{meetingPoint}</p>
                {meetingTime && (
                  <div className='inline-flex items-center gap-x-2'>
                    <div className='h-1 w-1 rounded-full bg-gray-200' />
                    <span className="text-xs font-medium text-gray-800">{meetingTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
