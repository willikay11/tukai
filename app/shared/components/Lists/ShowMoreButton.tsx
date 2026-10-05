'use client';

import { IconComponent } from '@/app/shared/components/Icons';

/**
 * "View more" / "View less", for a section that grows in place.
 *
 * A section with somewhere to send the reader uses a See all link instead.
 * This is for the ones with no page of their own - the rest of the rows are
 * already here, so revealing them beats a navigation that goes nowhere.
 */
export const ShowMoreButton = ({
  isExpanded,
  onExpand,
  onCollapse,
}: {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) => (
  <button
    type="button"
    onClick={isExpanded ? onCollapse : onExpand}
    className="-my-2 -mr-1 inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-1 text-[15px] font-bold text-brand hover:text-brand-deep"
  >
    {isExpanded ? 'View less' : 'View more'}
    <IconComponent
      iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
      size={18}
      color="currentColor"
      className="flex-shrink-0"
    />
  </button>
);
