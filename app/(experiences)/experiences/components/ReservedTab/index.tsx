'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';
import { Reservation } from '@/types/ticket-purchase';

import { TicketModal } from '../TicketModal';
import { ReservationCalendarPanel } from './ReservationCalendarPanel';
import { PanelItem, buildPanelItems } from './panelItems';
import { ExperienceReservationView, toExperienceReservationViews } from './types';

interface ReservedTabProps {
  reservations: Reservation[];
  reservedExperiences: Experience[];
  invites: Experience[];
  isLoading: boolean;
  downloadingKey: string | null;
  onDownloadAll: (reservation: Reservation) => void;
  onExplore: () => void;
}

export const ReservedTab = ({
  reservations,
  reservedExperiences,
  invites,
  isLoading,
  downloadingKey,
  onDownloadAll,
  onExplore,
}: ReservedTabProps) => {
  // One view per reserved experience, with every occurrence's tickets merged
  const views: ExperienceReservationView[] = useMemo(
    () => toExperienceReservationViews(reservedExperiences, reservations),
    [reservedExperiences, reservations],
  );

  // Reservations and invites share one date-ordered list in the panel
  const panelItems: PanelItem[] = useMemo(
    () => buildPanelItems(views, reservedExperiences, invites),
    [views, reservedExperiences, invites],
  );

  // The panel rows open the ticket modal, hoisted here so one instance serves
  // every row rather than mounting a modal per row
  const [calendarTicket, setCalendarTicket] = useState<ExperienceReservationView | null>(null);

  const shareLink = (experienceId: string) =>
    `${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experienceId}`;

  // A row covers every occurrence of its experience, so downloading walks all
  // of that experience's reservations
  const downloadForExperience = (experienceId: string) =>
    reservations
      .filter((item) => item.experienceId === experienceId)
      .forEach((item) => onDownloadAll(item));

  const isDownloadingExperience = (experienceId: string) =>
    reservations.some((item) => item.experienceId === experienceId && item.key === downloadingKey);

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-[420px] animate-pulse rounded-3xl bg-gray-100" />
      </div>
    );
  }

  if (panelItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <NoData message="You have no reserved experiences yet" />
        <Button onClick={onExplore} className="rounded-full px-6">
          Explore experiences
        </Button>
      </div>
    );
  }

  return (
    <div>
      <section className="w-full lg:max-w-[75%]">
        <h2 className="text-2xl font-bold text-gray-900">Reservations &amp; Invites</h2>
        {invites.length > 0 && (
          <p className="mt-1 text-sm text-gray-400">
            {invites.length} {invites.length === 1 ? 'invite' : 'invites'} waiting on you
          </p>
        )}

        <ReservationCalendarPanel
          items={panelItems}
          onViewTicket={(item) => setCalendarTicket(item.reservation ?? null)}
        />
      </section>

      {calendarTicket && (
        <TicketModal
          isOpen={Boolean(calendarTicket)}
          onClose={() => setCalendarTicket(null)}
          experienceTitle={calendarTicket.title}
          hostCommunity={calendarTicket.communityName}
          coverPhoto={calendarTicket.coverPhoto}
          occurrenceStart={calendarTicket.start}
          occurrenceEnd={calendarTicket.end}
          paymentStatus={calendarTicket.status}
          tickets={calendarTicket.tickets}
          shareLink={shareLink(calendarTicket.experienceId)}
          onDownloadAll={() => downloadForExperience(calendarTicket.experienceId)}
          isDownloading={isDownloadingExperience(calendarTicket.experienceId)}
        />
      )}
    </div>
  );
};
