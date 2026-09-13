'use client';

import numeral from 'numeral';

import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';
import { haversineKm } from '@/utils/geo-utils';

import { ResultThumbnail } from './ResultThumbnail';

const MS_PER_DAY = 86_400_000;

// A multi-day experience is described by its span, a single-day one by how long
// it runs. There is no duration field on the API — both are derived from the
// start and end timestamps.
//
// Note this deliberately does NOT use getNumberOfDaysAndNights: that helper is
// written for date-only itinerary ranges and adds an inclusive day, so a
// 09:00–12:00 experience comes back as two days.
const durationOf = (experience: Experience): string | null => {
  if (!experience.startDate || !experience.endDate) return null;

  const start = new Date(experience.startDate);
  const end = new Date(experience.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayCount = Math.round((startOfDay(end) - startOfDay(start)) / MS_PER_DAY) + 1;

  if (dayCount > 1) return `${dayCount} days`;

  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (minutes <= 0) return null;
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
};

export const ExperienceResultRow = ({
  item,
  onClick,
}: {
  item: Experience;
  onClick: () => void;
}) => {
  const { lat, lng } = useLocation();

  const experienceLat = item.location?.pointLat;
  const experienceLng = item.location?.pointLong;
  // The API returns no distance, so it is only known once the reader has set
  // their own location
  const distanceKm =
    lat !== undefined && lng !== undefined && experienceLat && experienceLng
      ? haversineKm(lat, lng, experienceLat, experienceLng)
      : null;

  const metaLine = [
    item.location?.city,
    distanceKm !== null ? `${distanceKm} Kms` : null,
    durationOf(item),
  ]
    .filter(Boolean)
    .join(' · ');

  const price = item.priceStartsFrom;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
    >
      <ResultThumbnail photos={item.photos} alt={item.title} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-gray-900">{item.title}</p>
        {price && (
          <p className="mt-0.5 truncate text-sm font-bold text-primary">
            {price.currency} {numeral(price.amount).format('0,0')}/Person
          </p>
        )}
        {metaLine && <p className="mt-0.5 truncate text-sm text-gray-400">{metaLine}</p>}
      </div>
    </button>
  );
};
