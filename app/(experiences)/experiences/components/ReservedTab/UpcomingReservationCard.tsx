'use client';

import { useState } from 'react';

import numeral from 'numeral';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { formatReservationDateTime } from '@/utils/date-utils';

import { TicketModal } from '../TicketModal';
import { ExperienceReservationView, isSettled } from './types';

interface UpcomingReservationCardProps {
  reservation: ExperienceReservationView;
  shareLink: string;
  onDownloadAll: () => void;
  isDownloading?: boolean;
}

export const UpcomingReservationCard = ({
  reservation,
  shareLink,
  onDownloadAll,
  isDownloading = false,
}: UpcomingReservationCardProps) => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const settled = isSettled(reservation.status);
  const dateTime = formatReservationDateTime(reservation.start ?? '', reservation.end ?? '');

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <PhotoImage
          src={reservation.coverPhoto}
          alt={reservation.title}
          fill
          sizes="(max-width: 640px) 100vw, 280px"
          className="object-cover"
        />

        {/* Settled reservations get a filled basket on white; anything still
            awaiting payment keeps the translucent add-to-basket circle */}
        <div className="absolute right-3 top-3">
          {settled ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <IconComponent
                iconName="ShoppingBasketCheckIn01Icon"
                size={16}
                variant="solid"
                className="text-primary"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <IconComponent iconName="ShoppingBasketAdd01Icon" size={16} className="text-white" />
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-base font-bold text-gray-900">{reservation.title}</p>

      {reservation.paidAmount !== null && (
        <p className="mt-0.5 text-sm text-gray-500">
          {reservation.currency} {numeral(reservation.paidAmount).format('0,0')} ·{' '}
          {reservation.ticketCount} {reservation.ticketCount === 1 ? 'ticket' : 'tickets'}
        </p>
      )}

      {dateTime && <p className="mt-0.5 text-sm text-gray-400">{dateTime}</p>}

      {reservation.tickets.length > 0 && (
        <button
          type="button"
          onClick={() => setIsTicketOpen(true)}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <IconComponent iconName="Ticket01Icon" size={15} className="text-primary" />
          View ticket
        </button>
      )}

      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        experienceTitle={reservation.title}
        hostCommunity={reservation.communityName}
        coverPhoto={reservation.coverPhoto}
        occurrenceStart={reservation.start}
        occurrenceEnd={reservation.end}
        paymentStatus={reservation.status}
        tickets={reservation.tickets}
        shareLink={shareLink}
        onDownloadAll={onDownloadAll}
        isDownloading={isDownloading}
      />
    </div>
  );
};
