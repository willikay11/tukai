import { IconComponent } from '@/app/shared/components/Icons';
import { safeText } from '@/utils/safe-text-utils';
interface IncludedExcludedSectionProps {
  included?: string;
  excluded?: string;
}

export const IncludedExcludedSection = ({
  included,
  excluded,
}: IncludedExcludedSectionProps) => {
    const sanitizedIncluded = included ? safeText(included) : '';
    const sanitizedExcluded = excluded ? safeText(excluded) : '';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-900 mb-3">What's included</h3>
          <div className="text-xs" dangerouslySetInnerHTML={{ __html: sanitizedIncluded }} />
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">What's not included</h3>
          <div className="text-xs" dangerouslySetInnerHTML={{ __html: sanitizedExcluded }} />
        </div>
    </div>
  );
};
