'use client';

import moment from 'moment';

import IconComponent from '@/app/components/iconComponent';
import { Location } from '@/types/location';

export interface ReviewLocationCardProps {
  title: string;
  location?: Location;
  startDate?: string;
  endDate?: string;
  showTime?: boolean;
}

export default function ReviewLocationCard({
  title,
  location,
  startDate,
  endDate,
  showTime = false,
}: ReviewLocationCardProps) {
  if (!location) {
    return null;
  }

  const formatTime = (date: string) => {
    const m = moment(date);
    return m.isValid() ? m.format('h:mm A') : '';
  };

  const timeRange =
    showTime && startDate && endDate
      ? `${formatTime(startDate)} - ${formatTime(endDate)}`
      : '';

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.pointLat},${location.pointLong}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        {/* Map thumbnail placeholder */}
        <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${location.pointLat},${location.pointLong}&zoom=14&size=80x64&markers=${location.pointLat},${location.pointLong}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
            alt="Map"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={handleOpenMaps}
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Open Maps
            <IconComponent iconName="Location01Icon" size={12} color="#059669" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-700">
        <span>{location.name || location.formattedAddress}</span>
        {timeRange && (
          <>
            <span className="text-gray-400">•</span>
            <span>{timeRange}</span>
          </>
        )}
        <IconComponent iconName="ArrowUpRight01Icon" size={12} color="#9CA3AF" />
      </div>
    </div>
  );
}
