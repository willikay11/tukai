'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface AddTicketTypeButtonProps {
  onClick: () => void;
}

export const AddTicketTypeButton = ({ onClick }: AddTicketTypeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800"
    >
      <IconComponent iconName="Tag01Icon" size={16} />
      <span>+ Add Another Ticket Type</span>
    </button>
  );
};
