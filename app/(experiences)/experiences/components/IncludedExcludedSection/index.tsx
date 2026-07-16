import { IconComponent } from '@/app/shared/components/Icons';
import { safeText } from '@/utils/safe-text-utils';

interface IncludedExcludedSectionProps {
  included?: string;
  excluded?: string;
}

export const IncludedExcludedSection = ({ included, excluded }: IncludedExcludedSectionProps) => {
  const sanitizedIncluded = included ? safeText(included) : '';
  const sanitizedExcluded = excluded ? safeText(excluded) : '';

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <h3 className="mb-3 font-bold text-gray-900">What's included</h3>
        <div className="text-xs" dangerouslySetInnerHTML={{ __html: sanitizedIncluded }} />
      </div>

      <div>
        <h3 className="mb-3 font-bold text-gray-900">What's not included</h3>
        <div className="text-xs" dangerouslySetInnerHTML={{ __html: sanitizedExcluded }} />
      </div>
    </div>
  );
};
