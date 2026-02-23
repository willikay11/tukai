'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

type CreateSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewCommunity?: () => void;
  onCreateExperience?: () => void;
  title?: string;
  description?: string;
  viewCommunityLabel?: string;
  createExperienceLabel?: string;
  illustrationSrc?: string;
};

export default function CreateSuccessDialog({
  open,
  onOpenChange,
  onViewCommunity,
  onCreateExperience,
  title = 'Community Created Successfully',
  description =
    'Your community was created successfully. You can now proceed to create your experience or view the community',
  viewCommunityLabel = 'View Community',
  createExperienceLabel = 'Create Experience',
  illustrationSrc = '/images/friday-feeling.svg',
}: CreateSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[560px] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-[220px] w-full max-w-[320px]">
            <Image
              src={illustrationSrc}
              alt="Community created"
              fill
              className="object-contain"
              priority
            />
          </div>

          <DialogTitle className="mt-6 text-xl font-semibold leading-tight text-slate-800">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-4 text-xs max-w-[450px] leading-4 text-slate-600">
            {description}
          </DialogDescription>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-primary px-6 text-primary"
              onClick={onViewCommunity}
            >
              {viewCommunityLabel}
            </Button>
            <Button
              type="button"
              variant="gradient"
              className="h-12 rounded-full px-6 text-white"
              onClick={onCreateExperience}
            >
              {createExperienceLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}