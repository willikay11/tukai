'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface PillTab {
  value: string;
  label: string;
}

/**
 * The segmented control used to switch between views of the same page — a
 * grey track with the active option raised as a white pill.
 *
 * Extracted from the experiences page, where this class string was written
 * inline; the communities page needs the same control, and two copies would
 * have drifted.
 */
export const PillTabs = ({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: PillTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <Tabs value={value} onValueChange={onChange} className={className}>
    <TabsList className="h-auto gap-0 rounded-full bg-gray-100 p-1">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="rounded-full border-0 px-5 py-2 text-sm font-normal text-gray-500 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:font-normal data-[state=active]:text-primary"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);
