import { Community } from '@/types/community';

import { ResultThumbnail } from './ResultThumbnail';

export const CommunityResultRow = ({ item, onClick }: { item: Community; onClick: () => void }) => {
  const activity = item.categories
    ?.map((category) => category.name)
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
    >
      <ResultThumbnail photos={item.photos} alt={item.title} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-gray-900">{item.title}</p>
        {activity && <p className="mt-0.5 truncate text-sm text-gray-400">{activity}</p>}
      </div>
    </button>
  );
};
