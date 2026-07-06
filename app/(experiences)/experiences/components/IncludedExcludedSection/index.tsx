import { IconComponent } from '@/app/shared/components/Icons';

interface IncludedExcludedSectionProps {
  included?: string;
  excluded?: string;
}

export const IncludedExcludedSection = ({
  included,
  excluded,
}: IncludedExcludedSectionProps) => {
  const includedItems = included
    ?.split('\n')
    .map((item) => item.trim())
    .filter(Boolean) || [];

  const excludedItems = excluded
    ?.split('\n')
    .map((item) => item.trim())
    .filter(Boolean) || [];

  if (includedItems.length === 0 && excludedItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {includedItems.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">What's included</h3>
          <ul className="space-y-2">
            {includedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <IconComponent
                  iconName="CheckmarkCircle01Icon"
                  size={16}
                  className="text-primary flex-shrink-0 mt-0.5"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {excludedItems.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">What's not included</h3>
          <ul className="space-y-2">
            {excludedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <IconComponent
                  iconName="Cancel01Icon"
                  size={16}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
