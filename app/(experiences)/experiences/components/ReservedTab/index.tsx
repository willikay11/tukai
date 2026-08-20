'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';
import { Reservation } from '@/types/ticket-purchase';

import { TicketModal } from '../TicketModal';
import { ReservationCalendarPanel } from './ReservationCalendarPanel';
import { UpcomingReservationCard } from './UpcomingReservationCard';
import { PanelItem, buildPanelItems } from './panelItems';
import {
  ExperienceReservationView,
  ReservationView,
  isExperiencePast,
  isExperienceUpcoming,
  toExperienceReservationViews,
  toReservationView,
} from './types';

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
  const views: ReservationView[] = useMemo(
    () => reservations.map((reservation) => toReservationView(reservation, reservedExperiences)),
    [reservations, reservedExperiences],
  );

  // One card per reserved experience — never one per ticket or per occurrence
  const experienceViews = useMemo(
    () => toExperienceReservationViews(reservedExperiences, reservations),
    [reservedExperiences, reservations],
  );
  const upcoming = useMemo(
    () => experienceViews.filter((view) => isExperienceUpcoming(view)),
    [experienceViews],
  );
  // Anything already finished still has to be reachable
  const past = useMemo(
    () => experienceViews.filter((view) => isExperiencePast(view)),
    [experienceViews],
  );

  // Reservations and invites share one date-ordered list in the panel
  const panelItems: PanelItem[] = useMemo(
    () => buildPanelItems(views, reservedExperiences, invites),
    [views, reservedExperiences, invites],
  );

  // The calendar row opens the same modal the cards do, so it is hoisted here
  // rather than duplicated per row
  const [calendarTicket, setCalendarTicket] = useState<ReservationView | null>(null);

  const shareLink = (experienceId: string) =>
    `${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experienceId}`;

  const findReservation = (key: string) => reservations.find((item) => item.key === key);

  // An experience card covers every occurrence the user booked, so downloading
  // from it walks each of that experience's reservations
  const downloadForExperience = (experienceId: string) =>
    reservations
      .filter((item) => item.experienceId === experienceId)
      .forEach((item) => onDownloadAll(item));

  const isDownloadingExperience = (experienceId: string) =>
    reservations.some((item) => item.experienceId === experienceId && item.key === downloadingKey);

  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[280px] animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (views.length === 0 && experienceViews.length === 0) {
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
      <section>
        <h2 className="text-2xl font-bold text-gray-900">Your Upcoming Experiences</h2>

        {upcoming.length === 0 ? (
          <div className="py-8">
            <NoData message="Nothing coming up right now" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((reservation) => (
              <UpcomingReservationCard
                key={reservation.key}
                reservation={reservation}
                shareLink={shareLink(reservation.experienceId)}
                onDownloadAll={() => downloadForExperience(reservation.experienceId)}
                isDownloading={isDownloadingExperience(reservation.experienceId)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
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

      {past.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Past Experiences</h2>
            <span className="flex-shrink-0 text-sm text-gray-400">
              {past.length} {past.length === 1 ? 'experience' : 'experiences'}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {past.map((reservation) => (
              <UpcomingReservationCard
                key={reservation.key}
                reservation={reservation}
                shareLink={shareLink(reservation.experienceId)}
                onDownloadAll={() => downloadForExperience(reservation.experienceId)}
                isDownloading={isDownloadingExperience(reservation.experienceId)}
              />
            ))}
          </div>
        </section>
      )}

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
          onDownloadAll={() => {
            const source = findReservation(calendarTicket.key);
            if (source) onDownloadAll(source);
          }}
          isDownloading={downloadingKey === calendarTicket.key}
        />
      )}
    </div>
  );
};
