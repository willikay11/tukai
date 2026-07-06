import Link from 'next/link';

import { GoogleMapComponent } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';

interface LocationMeetingSectionProps {
  experience: Experience;
}

export const LocationMeetingSection = ({ experience }: LocationMeetingSectionProps) => {
  const googleMapsUrl =
    experience.location && experience.location.point
      ? `https://maps.google.com/?q=${experience.location.point.coordinates[1]},${experience.location.point.coordinates[0]}`
      : '#';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Location</h3>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <GoogleMapComponent
              lat={experience.location.point.coordinates[1]}
              lng={experience.location.point.coordinates[0]}
              thumbnail
            />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {experience.location.city}, {experience.location.country}
            </p>
            <Link
              href={googleMapsUrl}
              target="_blank"
              className="text-xs text-primary underline"
            >
              View on Google Maps
            </Link>
          </div>
        </div>
      </div>

      {(experience.meetingPoint || experience.meetingTime) && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Meeting Point & Time</h3>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <IconComponent
                iconName="Location01Icon"
                size={20}
                className="text-primary"
              />
            </div>
            <div>
              {experience.meetingPoint && (
                <p className="font-semibold text-sm">{experience.meetingPoint}</p>
              )}
              {experience.meetingTime && (
                <p className="text-xs text-gray-500">{experience.meetingTime}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
