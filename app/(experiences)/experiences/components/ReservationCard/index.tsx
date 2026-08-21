'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { ReservationTicket } from '@/types/ticket-purchase';
import { formatReservationDateTime } from '@/utils/date-utils';

import { PaymentStatusBadge } from '../PaymentStatusBadge';
import { TicketModal } from '../TicketModal';

interface ReservationCardProps {
  title: string;
  coverPhoto: string | null;
  occurrenceStart: string | null;
  occurrenceEnd: string | null;
  communityName: string | null;
  ticketCount: number;
  status: string;
  tickets: ReservationTicket[];
  shareLink: string;
  onDownloadAll: () => void;
  isDownloading?: boolean;
}

export const ReservationCard = ({
  title,
  coverPhoto,
  occurrenceStart,
  occurrenceEnd,
  communityName,
  ticketCount,
  status,
  tickets,
  shareLink,
  onDownloadAll,
  isDownloading = false,
}: ReservationCardProps) => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const dateTime =
    occurrenceStart && occurrenceEnd
      ? formatReservationDateTime(occurrenceStart, occurrenceEnd)
      : null;

  const metaLine = [dateTime, communityName].filter(Boolean).join(' · ');

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Cover with status badge */}
      <div className="relative h-[240px]">
        <PhotoImage
          src={coverPhoto}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
        />
        <div className="absolute left-4 top-4">
          <PaymentStatusBadge status={status} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <p className="text-lg font-bold text-gray-900">{title}</p>

        {metaLine && <p className="mt-1 text-sm text-gray-500">{metaLine}</p>}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <IconComponent iconName="Ticket01Icon" size={16} className="text-primary" />
            <span className="text-sm text-gray-700">
              {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          {tickets.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                // The card is wrapped in a link to the experience — keep the
                // ticket action from also triggering that navigation
                e.preventDefault();
                e.stopPropagation();
                setIsTicketOpen(true);
              }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View ticket
            </button>
          )}
        </div>
      </div>

      {/* Renders in a portal, so clicks inside never reach the wrapping link */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        experienceTitle={title}
        hostCommunity={communityName}
        coverPhoto={coverPhoto}
        occurrenceStart={occurrenceStart}
        occurrenceEnd={occurrenceEnd}
        paymentStatus={status}
        tickets={tickets}
        shareLink={shareLink}
        onDownloadAll={onDownloadAll}
        isDownloading={isDownloading}
      />
    </div>
  );
};
