'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Share } from '@/app/shared/components/Share';
import { useExperienceTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { downloadTicketPdf } from '@/services/experience';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { experiencePath } from '@/utils/detail-paths';
import {
  groupPurchasesByType,
  TicketTypeGroup,
  TicketTypeGroupTicket,
} from '@/utils/ticket-utils';

const downloadOne = async (ticket: TicketTypeGroupTicket) => {
  const blob = await downloadTicketPdf(ticket.id);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${ticket.ticketNumber}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
};

/**
 * The buyer's own tickets for this experience (ED-11), one row per ticket
 * type rather than per occurrence (groupTicketPurchases) - a signed-out
 * reader, or one with no completed purchase here, sees nothing at all.
 *
 * A type's row opens into a layered detail view - one individual ticket's
 * full QR at a time, paged when that type covers more than one - rather than
 * a separate modal (TicketModal), since the drawer already has the room.
 */
export const ExperienceMyTickets = ({ experience }: { experience: Experience }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [downloadingGroup, setDownloadingGroup] = useState<string | null>(null);
  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);

  const { data: purchasesResponse } = useExperienceTicketPurchases(
    experience.id,
    Boolean(session?.user),
  );

  const ticketGroups = groupPurchasesByType(purchasesResponse?.data?.results ?? []);

  if (ticketGroups.length === 0) return null;

  const activeGroup = ticketGroups[Math.min(activeIndex, ticketGroups.length - 1)];
  const activeTicket =
    activeGroup.tickets[Math.min(activeTicketIndex, activeGroup.tickets.length - 1)];

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}${experiencePath(experience)}`;
  const coverPhoto = coverPhotoUrl(experience.photos, 'md') ?? '';

  const toastDownloadError = () => {
    toast({
      title: 'Error',
      description: 'Could not download your tickets. Please try again.',
      variant: 'destructive',
    });
  };

  // No bulk-download endpoint - the same one-at-a-time pattern ExperiencesPageContent
  // uses for a whole reservation, scoped here to one ticket type
  const handleDownloadGroup = async (group: TicketTypeGroup) => {
    setDownloadingGroup(group.ticketType);
    try {
      for (const ticket of group.tickets) {
        await downloadOne(ticket);
      }
    } catch {
      toastDownloadError();
    } finally {
      setDownloadingGroup(null);
    }
  };

  const handleDownloadTicket = async (ticket: TicketTypeGroupTicket) => {
    setDownloadingTicketId(ticket.id);
    try {
      await downloadOne(ticket);
    } catch {
      toastDownloadError();
    } finally {
      setDownloadingTicketId(null);
    }
  };

  const changeType = (index: number) => {
    setActiveIndex(index);
    setIsTicketOpen(false);
    setActiveTicketIndex(0);
  };

  return (
    <section className="space-y-4 border-t border-line pt-6">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between"
      >
        <h3 className="text-[22px] font-bold text-brand-ink">My tickets</h3>
        <IconComponent
          iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
          size={20}
          color="currentColor"
          className="text-brand-ink"
        />
      </button>

      {isExpanded &&
        (isTicketOpen ? (
          <div className="space-y-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                <IconComponent
                  iconName="Ticket01Icon"
                  size={24}
                  color="currentColor"
                  className="text-primary"
                />
              </div>

              <div className="flex flex-1 items-center gap-6">
                <p className="text-base font-bold text-brand-ink">
                  Ticket {activeTicketIndex + 1} of {activeGroup.tickets.length}
                </p>
                <div>
                  <p className="text-base font-bold text-brand-ink">{activeGroup.ticketType}</p>
                  <p className="text-xs text-ink-muted">Ticket type</p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketOpen(false)}
                  className="flex items-center gap-1 text-sm font-semibold text-brand"
                >
                  Hide
                  <IconComponent iconName="ArrowUp01Icon" size={16} color="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadTicket(activeTicket)}
                  disabled={downloadingTicketId === activeTicket.id}
                  aria-label="Download this ticket"
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-400 disabled:opacity-50"
                >
                  <IconComponent iconName="Download01Icon" size={18} color="currentColor" />
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative h-56 w-56 overflow-hidden rounded-2xl bg-white p-4">
                {activeTicket.qrCodeImage && (
                  <PhotoImage
                    src={activeTicket.qrCodeImage}
                    alt={`QR code for ${activeGroup.ticketType}`}
                    fill
                    sizes="224px"
                    className="object-contain"
                  />
                )}
              </div>
            </div>

            <p className="text-center text-base font-bold tracking-[0.2em] text-brand-ink">
              {activeTicket.ticketNumber}
            </p>

            <p className="text-center text-sm text-ink-muted">
              Show this at the entrance. Turn your brightness up if it does not scan.
            </p>

            {activeGroup.tickets.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTicketIndex((index) => Math.max(index - 1, 0))}
                  disabled={activeTicketIndex === 0}
                  aria-label="Previous ticket"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40"
                >
                  <IconComponent iconName="ArrowLeft01Icon" size={14} className="text-gray-800" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTicketIndex((index) =>
                      Math.min(index + 1, activeGroup.tickets.length - 1),
                    )
                  }
                  disabled={activeTicketIndex === activeGroup.tickets.length - 1}
                  aria-label="Next ticket"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40"
                >
                  <IconComponent iconName="ArrowRight01Icon" size={14} className="text-gray-800" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2.5">
              <Share
                coverPhoto={coverPhoto}
                title={experience.title}
                link={shareLink}
                kind="experience"
                variant="icon"
                showLabel
              />

              <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-dot" />

              <button
                type="button"
                onClick={() => handleDownloadGroup(activeGroup)}
                disabled={downloadingGroup === activeGroup.ticketType}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink disabled:opacity-50"
              >
                <IconComponent
                  iconName="Download01Icon"
                  size={18}
                  color="currentColor"
                  className="text-gray-400"
                />
                {downloadingGroup === activeGroup.ticketType ? 'Downloading…' : 'Download'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTicketIndex(0);
                  setIsTicketOpen(true);
                }}
                aria-label={`View ${activeGroup.ticketType} ticket`}
                className="flex flex-1 items-center gap-4 text-left"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white p-1.5">
                  {activeGroup.tickets[0].qrCodeImage && (
                    <PhotoImage
                      src={activeGroup.tickets[0].qrCodeImage}
                      alt={`QR code for ${activeGroup.ticketType}`}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  )}
                </div>

                <div className="h-10 w-px flex-shrink-0 border-l border-dashed border-blue-200" />

                <div className="flex flex-1 items-center gap-6">
                  <div>
                    <p className="text-base font-bold text-brand-ink">
                      {activeGroup.tickets.length}
                    </p>
                    <p className="text-xs text-ink-muted">Quantity</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-brand-ink">{activeGroup.ticketType}</p>
                    <p className="text-xs text-ink-muted">Ticket type</p>
                  </div>
                </div>
              </button>

              <div className="flex flex-shrink-0 items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center">
                  <Share
                    coverPhoto={coverPhoto}
                    title={experience.title}
                    link={shareLink}
                    kind="experience"
                    variant="icon"
                  />
                </div>

                <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-dot" />

                <button
                  type="button"
                  onClick={() => handleDownloadGroup(activeGroup)}
                  disabled={downloadingGroup === activeGroup.ticketType}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink disabled:opacity-50"
                >
                  <IconComponent
                    iconName="Download01Icon"
                    size={18}
                    color="currentColor"
                    className="text-gray-400"
                  />
                  {downloadingGroup === activeGroup.ticketType ? 'Downloading…' : 'Download'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <IconComponent
                  iconName="Tick02Icon"
                  size={16}
                  color="currentColor"
                  className="text-primary"
                />
                <span className="text-sm font-semibold text-brand-ink">Paid in full</span>
              </div>

              {/* A single ticket type needs no paging - same rule TicketModal and
                  the photo carousels use for a lone item */}
              {ticketGroups.length > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => changeType(Math.max(activeIndex - 1, 0))}
                    disabled={activeIndex === 0}
                    aria-label="Previous ticket type"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40"
                  >
                    <IconComponent iconName="ArrowLeft01Icon" size={14} className="text-gray-800" />
                  </button>
                  <span className="text-sm font-medium text-ink-muted">
                    {activeIndex + 1} of {ticketGroups.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeType(Math.min(activeIndex + 1, ticketGroups.length - 1))}
                    disabled={activeIndex === ticketGroups.length - 1}
                    aria-label="Next ticket type"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40"
                  >
                    <IconComponent
                      iconName="ArrowRight01Icon"
                      size={14}
                      className="text-gray-800"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
    </section>
  );
};
