import ScrollFilters from '@/app/components/scrollFilters';

export default async function CommunityFilters({ category }: { category?: string }) {
  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <ScrollFilters
            filters={[
              { label: 'My Communities', value: 'my-communities', icon: 'UserGroupIcon' },
              { label: 'Recommended', value: 'recommended', icon: 'UserSearch01Icon' },
              { label: 'Posts', value: 'posts', icon: 'GridViewIcon' },
            ]}
            selectedCategory={category ?? 'my-communities'}
          />
        </div>
      </div>
    </div>
  );
}
