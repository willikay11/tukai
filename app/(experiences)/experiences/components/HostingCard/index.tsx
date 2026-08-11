'use client';

import Image from 'next/image';
import Link from 'next/link';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { PaymentStatusBadge, StatusConfig } from '../PaymentStatusBadge';

// Exhaustive over the Status enum — tsc fails here if a status is unhandled.
// Labels mirror the Status enum wording so the badge reads the same wherever
// it appears (Hosting tab and the pre-wizard listing).
const HOSTING_STATUS_CONFIG: Record<Status, StatusConfig> = {
  [Status.Published]: { label: 'Published', dot: 'bg-primary', text: 'text-primary' },
  [Status.Draft]: { label: 'Draft', dot: 'bg-gray-400', text: 'text-gray-600' },
  [Status.Cancelled]: { label: 'Cancelled', dot: 'bg-red-500', text: 'text-red-600' },
};

// The API returns statuses lowercase ('published') while the enum is uppercase
const normalizeStatus = (status: string): string => String(status).toUpperCase();

const buildHostingMetaLine = (experience: Experience): string => {
  const city = experience.location?.city;

  switch (normalizeStatus(experience.status)) {
    case Status.Published:
      return [
        city,
        experience.startDate ? moment(experience.startDate).format('ddd D MMMM') : null,
        experience.startDate ? moment(experience.startDate).format('h:mm A') : null,
      ]
        .filter(Boolean)
        .join(' · ');
    case Status.Draft:
      return [city, 'Not published'].filter(Boolean).join(' · ');
    case Status.Cancelled:
      return [city, 'Cancelled'].filter(Boolean).join(' · ');
    default:
      return city ?? '';
  }
};

const buildHostingFooterText = (experience: Experience): string => {
  switch (normalizeStatus(experience.status)) {
    case Status.Published: {
      const sold = experience.reservedTicketsCount ?? 0;
      const remaining = Number(experience.ticketsAvailable) || 0;
      const total = sold + remaining;
      return total > 0 ? `${sold} / ${total} tickets sold` : 'No tickets yet';
    }
    case Status.Draft:
      // The API has no last-edited field — creation time is the closest signal
      return experience.dateCreated ? `Created ${moment(experience.dateCreated).fromNow()}` : '';
    case Status.Cancelled:
      return 'Hidden from Explore';
    default:
      return '';
  }
};

interface HostingCardProps {
  experience: Experience;
}

export const HostingCard = ({ experience }: HostingCardProps) => {
  const coverPhoto =
    experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    experience.photos?.[0]?.photo;

  const status = normalizeStatus(experience.status);
  const isDraft = status === Status.Draft;
  // A draft has nothing to manage yet, so it reopens in the create wizard.
  // Anything published goes to the host's Creator Studio dashboard — this card
  // only ever renders in host contexts (Hosting tab, pre-wizard listing).
  const manageHref = isDraft
    ? `/experiences/create?experienceId=${experience.id}`
    : `/creator-studio/experiences/${experience.id}`;

  const metaLine = buildHostingMetaLine(experience);
  const footerText = buildHostingFooterText(experience);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Cover with status badge */}
      <div className="relative h-[200px]">
        {coverPhoto ? (
          <Image
            src={coverPhoto}
            alt={experience.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
        <div className="absolute left-4 top-4">
          <PaymentStatusBadge status={status} config={HOSTING_STATUS_CONFIG} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <p className="text-base font-bold text-gray-900">{experience.title}</p>

        {metaLine && <p className="mt-1 text-sm text-gray-500">{metaLine}</p>}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <IconComponent
              iconName="Ticket01Icon"
              size={16}
              className="flex-shrink-0 text-primary"
            />
            <span className="truncate text-sm text-gray-700">{footerText}</span>
          </div>

          <Link
            href={manageHref}
            className="flex-shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
};
