import { OpenInMapsLink } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { PlaceLink } from '@/app/shared/components/Places';
import { Experience } from '@/types/experience';
import { photoUrl } from '@/types/photo';

import { EXPERIENCE_SECTIONS } from './tabs';

/**
 * Location and meeting point (ED-07), built on the same pieces the place
 * drawer uses for directions: `OpenInMapsLink` for the maps link, and
 * `PlaceLink` for the venue name when the experience is tied to a place.
 *
 * The maps link sits as a quiet line under the venue name rather than a
 * separate button, and as its own anchor rather than nested inside
 * `PlaceLink`'s - two anchors stacked is valid, one inside the other is not.
 */
export const ExperienceLocationSection = ({ experience }: { experience: Experience }) => {
  const place = experience.place;
  const location = experience.location;

  const placePhoto = place?.photos?.[0] ? photoUrl(place.photos[0], 'md') : undefined;
  const venueName = place?.title ?? location?.name;
  const addressLine = [location?.city, location?.country].filter(Boolean).join(', ');
  const mapsQuery = [venueName, addressLine].filter(Boolean).join(', ') || undefined;
  const hasVenue = Boolean(venueName || addressLine);
  const hasMeeting = Boolean(experience.meetingPlace || experience.meetingTime);

  if (!hasVenue && !hasMeeting) return null;

  const thumb = (photo: string | undefined, alt: string) => (
    <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-surface-muted">
      {photo ? (
        <PhotoImage src={photo} alt={alt} fill sizes="72px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <IconComponent
            iconName="Location01Icon"
            size={24}
            color="currentColor"
            className="text-brand"
          />
        </div>
      )}
    </div>
  );

  const nameLine = venueName ? (
    place ? (
      <PlaceLink
        place={place}
        className="flex w-fit max-w-full items-center gap-1 text-[15px] font-semibold text-brand-ink hover:underline"
      >
        <span className="truncate">{venueName}</span>
        <IconComponent
          iconName="ArrowUpRight01Icon"
          size={16}
          color="currentColor"
          className="flex-shrink-0 text-brand"
        />
      </PlaceLink>
    ) : (
      <p className="truncate text-[15px] font-semibold text-brand-ink">{venueName}</p>
    )
  ) : null;

  return (
    <div id={EXPERIENCE_SECTIONS.where} className="scroll-mt-[156px] border-t border-line pt-6">
      <div className="flex flex-wrap gap-x-10 gap-y-6">
        {hasVenue && (
          <div className="min-w-[260px] flex-1 space-y-4">
            <h3 className="text-[22px] font-bold text-brand-ink">Location</h3>

            <div className="flex items-center gap-3">
              {thumb(placePhoto, venueName ?? '')}
              <div className="min-w-0 flex-1">
                {nameLine}
                {addressLine && (
                  <p className="truncate text-[14px] text-ink-muted">{addressLine}</p>
                )}

                <OpenInMapsLink
                  lat={location?.pointLat}
                  lng={location?.pointLong}
                  query={mapsQuery}
                  className="mt-0.5 text-[13px] text-brand"
                >
                  <IconComponent iconName="Location01Icon" size={14} color="currentColor" />
                  View on Google Maps
                </OpenInMapsLink>
              </div>
            </div>
          </div>
        )}

        {hasMeeting && (
          <div className="min-w-[260px] flex-1 space-y-4">
            <h3 className="text-[22px] font-bold text-brand-ink">Meeting point and time</h3>

            <div className="flex items-center gap-3">
              {thumb(placePhoto, experience.meetingPlace ?? '')}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-[15px] text-brand-ink">
                  {experience.meetingPlace && (
                    <span className="truncate font-semibold">{experience.meetingPlace}</span>
                  )}
                  {experience.meetingPlace && experience.meetingTime && (
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 flex-shrink-0 rounded-full bg-ink-subtle"
                    />
                  )}
                  {experience.meetingTime && <span>{experience.meetingTime}</span>}
                </p>

                <OpenInMapsLink
                  query={experience.meetingPlace}
                  className="mt-0.5 text-[13px] text-brand"
                >
                  <IconComponent iconName="Location01Icon" size={14} color="currentColor" />
                  View on Google Maps
                </OpenInMapsLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
