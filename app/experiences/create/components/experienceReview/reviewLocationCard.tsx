'use client';

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
  location: _location,
  startDate: _startDate,
  endDate: _endDate,
  showTime: _showTime = false,
}: ReviewLocationCardProps) {
  const isMeetingSection = title.toLowerCase().includes('meeting');

  const cardData = isMeetingSection
    ? {
        imageUrl:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        label: 'Mount Kalebwani',
        timeRange: '10:00 AM - 5:00 PM',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Mount+Kalebwani',
      }
    : {
        imageUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        label: 'Picasso Steakhouse & Restaurant',
        timeRange: '',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Picasso+Steakhouse+Restaurant',
      };

  const handleOpenMaps = () => {
    window.open(cardData.mapUrl, '_blank');
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-3 rounded-[12px] border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="h-[75px] w-[130px] flex-shrink-0 overflow-hidden rounded-[12px] bg-gray-100">
            <img src={cardData.imageUrl} alt={cardData.label} className="h-full w-full object-cover" />
          </div>

          <button
            type="button"
            onClick={handleOpenMaps}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-2 text-xs font-medium text-emerald-900"
          >
            Open Maps
            <IconComponent iconName="Location01Icon" size={16} color="#065F46" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-700">
          <span>{cardData.label}</span>
          {cardData.timeRange && (
            <>
              <span className="text-gray-300">|</span>
              <span>{cardData.timeRange}</span>
            </>
          )}
          <IconComponent iconName="ArrowUpRight01Icon" size={16} color="#4F7DFF" />
        </div>
      </div>
    </div>
  );
}
