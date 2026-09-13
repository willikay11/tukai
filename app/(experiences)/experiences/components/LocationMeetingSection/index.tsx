import Link from 'next/link';

import { GoogleMapComponent } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';

interface LocationMeetingSectionProps {
  experience: Experience;
}

export const LocationMeetingSection = ({ experience }: LocationMeetingSectionProps) => {
  // A create-flow preview may not have coordinates yet, so nothing here may
  // index into `coordinates` unguarded
  const coordinates = experience.location?.point?.coordinates;
  const lat = coordinates?.[1];
  const lng = coordinates?.[0];

  const googleMapsUrl =
    lat != null && lng != null ? `https://maps.google.com/?q=${lat},${lng}` : '#';

  const locationLabel = [experience.location?.city, experience.location?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-3 text-xl font-bold text-gray-900">Location</h3>
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
            <GoogleMapComponent lat={lat} lng={lng} />
          </div>
          <div>
            <p className="text-sm font-semibold">{locationLabel}</p>
            {googleMapsUrl !== '#' && (
              <Link
                href={googleMapsUrl}
                target="_blank"
                className="text-sm font-semibold text-primary"
              >
                View on Google Maps
              </Link>
            )}
          </div>
        </div>
      </div>

      {(experience.meetingPoint || experience.meetingTime) && (
        <div>
          <h3 className="mb-3 text-xl font-bold text-gray-900">Meeting Point & Time</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <IconComponent iconName="Location01Icon" size={20} className="text-primary" />
            </div>
            <div>
              {experience.meetingPoint && (
                <p className="text-sm font-semibold">{experience.meetingPoint}</p>
              )}
              {experience.meetingTime && (
                <p className="text-sm text-gray-500">{experience.meetingTime}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
