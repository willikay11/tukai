'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface ExperienceCreatedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceId?: string;
  /**
   * Where the button goes, for callers whose subject is not an experience — a
   * requested table reservation, say. Without it the destination is derived
   * from `experienceId` as before.
   */
  href?: string;
  onViewExperience?: () => void;
  title?: string;
  description?: string;
  viewExperienceLabel?: string;
  illustrationSrc?: string;
}

export const ExperienceCreatedModal = ({
  open,
  onOpenChange,
  experienceId,
  href,
  onViewExperience,
  title = 'Experience Created Successfully!',
  description = 'Your experience has been created and is now live. Share it with your community and start receiving bookings.',
  viewExperienceLabel = 'View Experience',
  illustrationSrc = '/images/friday-feeling.svg',
}: ExperienceCreatedModalProps) => {
  const target = href ?? (experienceId ? `/experiences/${experienceId}` : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[440px] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-[220px] w-full max-w-[320px]">
            <Image
              src={illustrationSrc}
              alt="Experience created"
              fill
              className="object-contain"
              priority
            />
          </div>

          <DialogTitle className="mt-6 text-xl font-semibold leading-tight text-slate-800">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-4 max-w-[340px] text-xs leading-4 text-slate-600">
            {description}
          </DialogDescription>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
            {target && onViewExperience ? (
              <Button
                type="button"
                variant="gradient"
                className="h-12 rounded-full px-6 text-white"
                onClick={() => {
                  onViewExperience();
                  onOpenChange(false);
                }}
              >
                {viewExperienceLabel}
              </Button>
            ) : target ? (
              <Button
                type="button"
                variant="gradient"
                className="h-12 rounded-full px-6 text-white"
                asChild
              >
                <Link href={target} onClick={() => onOpenChange(false)}>
                  {viewExperienceLabel}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
