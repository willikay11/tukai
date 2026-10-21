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
  'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50';

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
        <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
        <span className="block text-sm text-ink-muted">{item.description}</span>
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} onClick={onSelect} className={rowClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={rowClasses}>
      {content}
    </button>
  );
};

export const CreateMenu = ({ onSelect }: CreateMenuProps) => (
  <div className="w-64 p-2">
    {CREATE_MENU_ITEMS.map((item) => (
      <MenuRow key={item.id} item={item} onSelect={() => onSelect(item.id)} />
    ))}
  </div>
);
