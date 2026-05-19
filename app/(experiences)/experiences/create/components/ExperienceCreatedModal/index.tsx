'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface ExperienceCreatedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceId?: string;
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
  onViewExperience,
  title = 'Experience Created Successfully!',
  description = 'Your experience has been created and is now live. Share it with your community and start receiving bookings.',
  viewExperienceLabel = 'View Experience',
  illustrationSrc = '/images/friday-feeling.svg',
}: ExperienceCreatedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[560px] rounded-2xl p-6 sm:p-8">
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
          <DialogDescription className="mt-4 max-w-[450px] text-xs leading-4 text-slate-600">
            {description}
          </DialogDescription>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center justify-center">
            {experienceId && onViewExperience ? (
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
            ) : experienceId ? (
              <Button
                type="button"
                variant="gradient"
                className="h-12 rounded-full px-6 text-white"
                asChild
              >
                <Link href={`/experiences/${experienceId}`} onClick={() => onOpenChange(false)}>
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
