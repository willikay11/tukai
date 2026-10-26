'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';

import { CREATE_MENU_ITEMS, CreateMenuItem, CreateMenuItemId } from './items';

interface CreateMenuProps {
  // Fired for every row, link or not - a link still navigates on its own, but
  // the popover it sits in needs telling either way so it closes.
  onSelect: (id: CreateMenuItemId) => void;
}

const rowClasses =
  'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface';

const MenuRow = ({ item, onSelect }: { item: CreateMenuItem; onSelect: () => void }) => {
  const content = (
    <>
      <IconComponent
        iconName={item.icon}
        variant="duotone"
        size={20}
        color="currentColor"
        className="mt-0.5 flex-shrink-0 text-brand"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold text-brand-ink">{item.label}</span>
        <span className="block text-[13px] leading-[1.4] text-ink-muted">{item.description}</span>
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} onClick={onSelect} role="menuitem" className={rowClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onSelect} className={rowClasses}>
      {content}
    </button>
  );
};

export const CreateMenu = ({ onSelect }: CreateMenuProps) => (
  <div role="menu" aria-label="Create" className="flex w-[288px] flex-col gap-0.5 p-2">
    {CREATE_MENU_ITEMS.map((item) => (
      <MenuRow key={item.id} item={item} onSelect={() => onSelect(item.id)} />
    ))}
  </div>
);
