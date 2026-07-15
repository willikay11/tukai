import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiImage } from '@/components/ui/image';
import { SearchResult, SearchResultType } from '@/types/search';
import { Photo } from '@/types/photo';

const TYPE_LABEL: Record<SearchResultType, string> = {
  experience: 'Experience',
  place: 'Place',
  community: 'Community',
};

interface ResultRowProps {
  result: SearchResult;
  onSelect: () => void;
}

export const ResultRow = ({ result, onSelect }: ResultRowProps) => {
  const coverPhoto =
    result.data.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    result.data.photos?.[0]?.photo;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      {/* Thumbnail */}
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {coverPhoto ? (
          <TukaiImage
            src={coverPhoto}
            alt={result.data.title}
            fill
            style={{ objectFit: 'cover' }}
            showNotFoundText={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <IconComponent iconName="Image01Icon" size={16} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-gray-900">{result.data.title}</p>
        {result.data.location?.formattedAddress && (
          <p className="truncate text-sm text-gray-500">
            {result.data.location.formattedAddress}
          </p>
        )}
      </div>

      {/* Type pill */}
      <span className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
        {TYPE_LABEL[result.type]}
      </span>
    </button>
  );
};
