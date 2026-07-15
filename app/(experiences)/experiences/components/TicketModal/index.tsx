'use client';

import { useState } from 'react';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { Share } from '@/app/shared/components/Share';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ReservationTicket } from '@/types/ticket-purchase';
import { formatReservationDateTime } from '@/utils/date-utils';

import { PaymentStatusBadge } from '../PaymentStatusBadge';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceTitle: string;
  hostCommunity: string | null;
  coverPhoto: string | null;
  occurrenceStart: string | null;
  occurrenceEnd: string | null;
  paymentStatus: string;
  tickets: ReservationTicket[];
  shareLink: string;
  onDownloadAll: () => void;
  isDownloading?: boolean;
}

export const TicketModal = ({
  isOpen,
  onClose,
  experienceTitle,
  hostCommunity,
  coverPhoto,
  occurrenceStart,
  occurrenceEnd,
  paymentStatus,
  tickets,
  shareLink,
  onDownloadAll,
  isDownloading = false,
}: TicketModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const currentTicket = tickets[Math.min(activeIndex, tickets.length - 1)];
  const downloadableCount = tickets.filter((ticket) => ticket.hasPdf).length;

  const nextTicket = () => setActiveIndex((index) => Math.min(index + 1, tickets.length - 1));
  const prevTicket = () => setActiveIndex((index) => Math.max(index - 1, 0));

  if (!currentTicket) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-32px)] max-w-md overflow-y-auto rounded-3xl border-0 p-0">
        <DialogTitle className="sr-only">Tickets for {experienceTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          Your ticket QR codes for {experienceTitle} — scan at entry
        </DialogDescription>

        {/* Header image with overlay */}
        <div className="relative h-[180px]">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={experienceTitle}
              fill
              sizes="448px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

          <div className="absolute left-4 top-4">
            <PaymentStatusBadge status={paymentStatus} />
          </div>

          {/* Covers DialogContent's built-in close (same position, higher z) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
          >
            <IconComponent iconName="Cancel01Icon" size={18} className="text-gray-800" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xl font-bold text-white">{experienceTitle}</p>
            {hostCommunity && <p className="text-sm text-white/80">Hosted by {hostCommunity}</p>}
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {occurrenceStart && occurrenceEnd && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Date &amp; Time
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatReservationDateTime(occurrenceStart, occurrenceEnd)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Ticket Type
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {currentTicket.ticketType}
              </p>
            </div>
            {currentTicket.holderName && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Ticket Holder
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {currentTicket.holderName}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Ticket No.
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {currentTicket.ticketNumber}
              </p>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Scan at Entry
            </span>
            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>

          {/* Ticket paginator */}
          {tickets.length > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prevTicket}
                disabled={activeIndex === 0}
                aria-label="Previous ticket"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
              >
                <IconComponent iconName="ArrowLeft01Icon" size={16} className="text-gray-800" />
              </button>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">
                  Ticket {activeIndex + 1} of {tickets.length}
                </p>
                {currentTicket.holderName && (
                  <p className="text-xs text-gray-500">{currentTicket.holderName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={nextTicket}
                disabled={activeIndex === tickets.length - 1}
                aria-label="Next ticket"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40"
              >
                <IconComponent iconName="ArrowRight01Icon" size={16} className="text-gray-800" />
              </button>
            </div>
          )}

          {/* QR code */}
          <div className="flex justify-center">
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="relative h-48 w-48">
                {currentTicket.qrCodeImage ? (
                  <Image
                    src={currentTicket.qrCodeImage}
                    alt={`QR code for ${currentTicket.ticketNumber}`}
                    fill
                    sizes="192px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100">
                    <p className="px-4 text-center text-xs text-gray-500">
                      QR code unavailable for this ticket
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket number below QR */}
          <p className="text-center text-sm font-semibold tracking-wide text-gray-500">
            {currentTicket.ticketNumber}
          </p>

          {/* Dots */}
          {tickets.length > 1 && (
            <div className="flex justify-center gap-1.5">
              {tickets.map((ticket, index) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ticket ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onDownloadAll}
              disabled={isDownloading || downloadableCount === 0}
              className="h-11 flex-1 rounded-full"
            >
              <IconComponent iconName="Download01Icon" size={16} color="white" />
              {isDownloading ? 'Downloading…' : `Download all (${downloadableCount})`}
            </Button>
            <div className="flex-1 [&_button]:w-full [&_button]:justify-center">
              <Share coverPhoto={coverPhoto ?? ''} title={experienceTitle} link={shareLink} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
