'use client';

import { useState } from 'react';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlanThisDrawer } from '@/app/shared/components/Plans/PlanThisDrawer';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { experiencePath } from '@/utils/detail-paths';

/**
 * Booking stays on the experience's own page (ED-11), so the primary action
 * here pushes there rather than duplicating ticket selection. Planning is not
 * booking, so it stays in the footer, matching the place drawer's footer.
 */
export const ExperienceDrawerFooter = ({ experience }: { experience: Experience }) => {
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  return (
    <div className="sticky bottom-0 z-30 border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
      <div className="flex items-center gap-3">
        <Link
          href={experiencePath(experience)}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-lime text-[15px] font-bold text-brand-ink transition-colors hover:bg-lime-dark"
        >
          View experience
        </Link>

        <button
          type="button"
          onClick={() => setIsPlanOpen(true)}
          className="inline-flex h-12 flex-shrink-0 items-center gap-2.5 rounded-full bg-surface-brand px-6 text-[15px] font-bold text-brand-ink transition-colors hover:bg-surface-tab"
        >
          <IconComponent iconName="CalendarAdd01Icon" size={20} color="currentColor" />
          Plan this
        </button>
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
