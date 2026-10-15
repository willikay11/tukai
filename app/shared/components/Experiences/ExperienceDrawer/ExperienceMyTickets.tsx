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
import { groupPurchasesByType, TicketTypeGroup } from '@/utils/ticket-utils';

/**
 * The buyer's own tickets for this experience (ED-11), one row per ticket
 * type rather than per occurrence (groupTicketPurchases) - a signed-out
 * reader, or one with no completed purchase here, sees nothing at all.
 */
export const ExperienceMyTickets = ({ experience }: { experience: Experience }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: purchasesResponse } = useExperienceTicketPurchases(
    experience.id,
    Boolean(session?.user),
  );

  const ticketGroups = groupPurchasesByType(purchasesResponse?.data?.results ?? []);

  if (ticketGroups.length === 0) return null;

  const activeGroup = ticketGroups[Math.min(activeIndex, ticketGroups.length - 1)];

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}${experiencePath(experience)}`;
  const coverPhoto = coverPhotoUrl(experience.photos, 'md') ?? '';

  // No bulk-download endpoint - the same one-at-a-time pattern ExperiencesPageContent
  // uses for a whole reservation, scoped here to one ticket type
  const handleDownload = async (group: TicketTypeGroup) => {
    setDownloadingType(group.ticketType);
    try {
      for (const purchaseId of group.purchaseIds) {
        const blob = await downloadTicketPdf(purchaseId);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${group.ticketType}-${purchaseId}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Could not download your tickets. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingType(null);
    }
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

      {isExpanded && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white">
              {activeGroup.qrCodeImage && (
                <PhotoImage
                  src={activeGroup.qrCodeImage}
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
                <p className="text-base font-bold text-brand-ink">{activeGroup.quantity}</p>
                <p className="text-xs text-ink-muted">Quantity</p>
              </div>
              <div>
                <p className="text-base font-bold text-brand-ink">{activeGroup.ticketType}</p>
                <p className="text-xs text-ink-muted">Ticket type</p>
              </div>
            </div>

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
                onClick={() => handleDownload(activeGroup)}
                disabled={downloadingType === activeGroup.ticketType}
                className="flex items-center gap-1 text-sm font-medium text-brand disabled:opacity-50"
              >
                <IconComponent iconName="Download01Icon" size={16} color="currentColor" />
                {downloadingType === activeGroup.ticketType ? 'Downloading…' : 'Download'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <IconComponent iconName="Tick02Icon" size={16} color="currentColor" className="text-primary" />
              <span className="text-sm font-semibold text-brand-ink">Paid in full</span>
            </div>

            {/* A single ticket type needs no paging - same rule TicketModal and
                the photo carousels use for a lone item */}
            {ticketGroups.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
                  disabled={activeIndex === 0}
                  aria-label="Previous ticket"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40"
                >
                  <IconComponent iconName="ArrowLeft01Icon" size={14} className="text-gray-800" />
                </button>
                <span className="text-sm font-medium text-ink-muted">
                  {activeIndex + 1} of {ticketGroups.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((index) => Math.min(index + 1, ticketGroups.length - 1))
                  }
                  disabled={activeIndex === ticketGroups.length - 1}
                  aria-label="Next ticket"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-40"
                >
                  <IconComponent iconName="ArrowRight01Icon" size={14} className="text-gray-800" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
