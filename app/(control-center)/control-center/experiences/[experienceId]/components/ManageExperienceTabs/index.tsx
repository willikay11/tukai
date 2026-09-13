'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

export type ManageTabId = 'about' | 'sales' | 'tickets' | 'guests' | 'moments' | 'analytics';

export const MANAGE_TABS: Array<{ id: ManageTabId; label: string; icon: string }> = [
  { id: 'about', label: 'About', icon: 'InformationCircleIcon' },
  { id: 'sales', label: 'Sales', icon: 'Invoice01Icon' },
  { id: 'tickets', label: 'Tickets Created', icon: 'Ticket01Icon' },
  { id: 'guests', label: 'Invited Guests', icon: 'UserAdd01Icon' },
  { id: 'moments', label: 'Moments', icon: 'GridIcon' },
  { id: 'analytics', label: 'Analytics', icon: 'PieChartIcon' },
];

interface ManageExperienceTabsProps {
  active: ManageTabId;
  onChange: (tab: ManageTabId) => void;
  onMessageBuyers: () => void;
  onEdit: () => void;
}

export const ManageExperienceTabs = ({
  active,
  onChange,
  onMessageBuyers,
  onEdit,
}: ManageExperienceTabsProps) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div
      role="tablist"
      aria-label="Manage experience sections"
      className="flex gap-2 overflow-x-auto scrollbar-hide"
    >
      {MANAGE_TABS.map((tab) => {
        const isActive = tab.id === active;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-lime/20 text-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <IconComponent iconName={tab.icon} size={16} color="currentColor" />
            {tab.label}
          </button>
        );
      })}
    </div>

    <div className="flex flex-shrink-0 items-center gap-3">
      <Button
        type="button"
        onClick={onMessageBuyers}
        variant="gradient"
        className="flex items-center gap-2 rounded-full px-5"
      >
        <IconComponent iconName="Message01Icon" size={16} color="currentColor" />
        Message Buyers
      </Button>

      <Button
        type="button"
        onClick={onEdit}
        variant="lime"
        className="flex items-center gap-2 rounded-full px-5"
      >
        <IconComponent iconName="Edit02Icon" size={16} color="currentColor" />
        Edit
      </Button>
    </div>
  </div>
);
