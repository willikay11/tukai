'use client';

import { useState } from 'react';

import { experiencePriceLine } from '@/app/(experiences)/components/ExperienceCard/experience-flag';
import { IconComponent } from '@/app/shared/components/Icons';
import { PlanThisDrawer } from '@/app/shared/components/Plans/PlanThisDrawer';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { formatExperienceHeaderDate } from '@/utils/date-utils';

/**
 * Planning is not booking, so it stays in the footer, matching the place
 * drawer's footer. Reserving swaps the drawer over to the booking panel
 * (ED-11) rather than duplicating it here or sending the reader away.
 */
export const ExperienceDrawerFooter = ({
  experience,
  onMakeReservation,
}: {
  experience: Experience;
  onMakeReservation: () => void;
}) => {
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  const priceLine = experiencePriceLine(experience);
  const dateLine = formatExperienceHeaderDate(experience.startDate, experience.endDate);

  return (
    <div className="sticky bottom-0 z-30 border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {priceLine && (
            <p className="truncate text-[15px] font-bold text-brand-ink">{priceLine}</p>
          )}
          {dateLine && <p className="truncate text-[13px] text-ink-muted">{dateLine}</p>}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPlanOpen(true)}
            className="inline-flex h-12 flex-shrink-0 items-center gap-2.5 rounded-full bg-surface-brand px-6 text-[15px] font-bold text-brand transition-colors hover:bg-surface-tab"
          >
            <IconComponent iconName="CalendarAdd01Icon" size={20} color="currentColor" />
            Plan this
          </button>

          <button
            type="button"
            onClick={onMakeReservation}
            className="inline-flex h-12 flex-shrink-0 items-center gap-2.5 rounded-full bg-lime px-6 text-[15px] font-bold text-brand-ink transition-colors hover:bg-lime-dark"
          >
            <IconComponent iconName="Ticket01Icon" size={20} color="currentColor" />
            Make reservation
          </button>
        </div>
      </div>

      <PlanThisDrawer
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        subject={{
          kind: 'experience',
          refId: experience.id,
          title: experience.title,
          subtitle: experience.location?.city ?? undefined,
          photo: coverPhotoUrl(experience.photos, 'thumb'),
          refDate: experience.startDate,
          soldOut: Boolean(experience.isSoldOut),
        }}
      />
    </div>
  );
};
