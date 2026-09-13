import { IconComponent } from '@/app/shared/components/Icons';

interface SuggestionRowProps {
  name: string;
  subtitle: string;
  onSelect: () => void;
}

export const SuggestionRow = ({ name, subtitle, onSelect }: SuggestionRowProps) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
  >
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
      <IconComponent iconName="Location01Icon" size={18} className="text-gray-700" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-base font-bold text-gray-900">{name}</p>
      <p className="truncate text-sm text-gray-500">{subtitle}</p>
    </div>
  </button>
);
