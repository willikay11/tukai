import { IconComponent } from '@/app/shared/components/Icons';

interface MetaRowProps {
  location?: string;
  distanceKm?: number;
  durationMinutes?: number;
  rating?: number;
  reviewCount?: number;
}

const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

export const MetaRow = ({
  location,
  distanceKm,
  durationMinutes,
  rating,
  reviewCount,
}: MetaRowProps) => {
  const parts: (string | null)[] = [
    location || null,
    distanceKm ? `${distanceKm} Kms` : null,
    durationMinutes ? formatDuration(durationMinutes) : null,
    rating ? `⭐ ${rating} (${reviewCount || 0} reviews)` : null,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
      {parts.map((part, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-300">·</span>}
          <span>{part}</span>
        </div>
      ))}
    </div>
  );
};
