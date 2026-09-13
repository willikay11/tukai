'use client';

interface CommunityPreviewCategoryProps {
  categories: string[];
}

export const CommunityPreviewCategory = ({ categories }: CommunityPreviewCategoryProps) => {
  if (categories.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-gray-600">Category</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {categories.map((category) => (
          <span
            key={category}
            className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
};
