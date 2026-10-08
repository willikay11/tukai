import { OpenInMapsLink } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { PlaceLink } from '@/app/shared/components/Places';
import { Experience } from '@/types/experience';
import { photoUrl } from '@/types/photo';

/**
 * Location and meeting point (ED-07), built on the same pieces the place
 * drawer uses for directions: `OpenInMapsLink` for the maps link, and
 * `PlaceLink` for the venue name when the experience is tied to a place.
 */
export const ExperienceLocationSection = ({ experience }: { experience: Experience }) => {
  const place = experience.place;
  const location = experience.location;

  const placePhoto = place?.photos?.[0] ? photoUrl(place.photos[0], 'md') : undefined;
  const venueName = place?.title ?? location?.name;
  const addressLine = [location?.city, location?.country].filter(Boolean).join(', ');

  if (!venueName && !addressLine) return null;

  const thumb = (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
      {placePhoto ? (
        <PhotoImage src={placePhoto} alt={venueName ?? ''} fill sizes="48px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <IconComponent
            iconName="Location01Icon"
            size={20}
            color="currentColor"
            className="text-brand"
          />
        </div>
      )}
    </div>
  );

  const label = (
    <div className="min-w-0 flex-1">
      {venueName && <p className="truncate text-[15px] font-semibold text-brand-ink">{venueName}</p>}
      {addressLine && <p className="truncate text-[14px] text-ink-muted">{addressLine}</p>}
    </div>
  );

  return (
    <div className="space-y-4 border-t border-line pt-6">
      <h3 className="text-[22px] font-bold text-brand-ink">Location</h3>

      <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
        {place ? (
          <PlaceLink place={place} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
            {thumb}
            {label}
          </PlaceLink>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {thumb}
            {label}
          </div>
        )}

        <OpenInMapsLink
          lat={location?.pointLat}
          lng={location?.pointLong}
          query={[venueName, addressLine].filter(Boolean).join(', ') || undefined}
          className="flex-shrink-0 whitespace-nowrap rounded-full bg-lime px-4 py-2.5 text-[14px] font-bold text-brand-ink no-underline hover:bg-lime-dark"
        >
          Get directions
        </OpenInMapsLink>
      </div>

      {(experience.meetingPoint || experience.meetingTime) && (
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white">
            <IconComponent
              iconName="Location01Icon"
              size={20}
              color="currentColor"
              className="text-brand"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-brand-ink">Meeting point</p>
            {experience.meetingPoint && (
              <p className="truncate text-[14px] text-ink-muted">{experience.meetingPoint}</p>
            )}
            {experience.meetingTime && (
              <p className="text-[14px] text-ink-muted">{experience.meetingTime}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
