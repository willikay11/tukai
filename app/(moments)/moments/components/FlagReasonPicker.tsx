'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useFlagReasons } from '@/app/shared/hooks/useMoments';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlagReason, flagReasonLabel } from '@/types/moment';

interface FlagReasonPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (reasonId: string) => void;
  isSubmitting?: boolean;
}

export const FlagReasonPicker = ({
  open,
  onOpenChange,
  onSelect,
  isSubmitting = false,
}: FlagReasonPickerProps) => {
  const { data: response, isLoading } = useFlagReasons(open);
  const reasons: FlagReason[] = response?.data?.results ?? response?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : reasons.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">No reasons available right now.</p>
        ) : (
          <div className="space-y-1 py-2">
            {reasons.map((reason) => (
              <button
                key={reason.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => onSelect(reason.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {flagReasonLabel(reason)}
                <IconComponent iconName="ArrowRight01Icon" size={14} className="text-gray-300" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
