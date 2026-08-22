import { IconComponent } from '@/app/shared/components/Icons';

interface RecentSearchPillProps {
  term: string;
  onSelect: () => void;
}

export const RecentSearchPill = ({ term, onSelect }: RecentSearchPillProps) => (
  <button
    type="button"
    onClick={onSelect}
    className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-800 transition-colors hover:bg-gray-200"
  >
    <IconComponent iconName="Clock01Icon" size={16} className="flex-shrink-0 text-gray-500" />
    {term}
  </button>
);
