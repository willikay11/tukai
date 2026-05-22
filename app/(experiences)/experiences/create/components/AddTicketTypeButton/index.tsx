'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface AddTicketTypeButtonProps {
  onClick: () => void;
}

export const AddTicketTypeButton = ({ onClick }: AddTicketTypeButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="mt-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800 hover:text-emerald-900"
    >
      <IconComponent iconName="Ticket02Icon" size={18} />
      <span>Add Another Ticket Type</span>
    </button>
  );
};
