import ScrollFilters from '@/app/components/scrollFilters';

export default async function ExperienceFilters({ category }: { category?: string }) {
  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 md:col-span-10 md:col-start-2 md:mx-0">
          <ScrollFilters
            filters={[
              { label: 'All Experiences', value: 'all', icon: 'WorkoutStretchingIcon' },
              { label: 'Reserved Experiences', value: 'reserved', icon: 'CalendarAdd01Icon' },
              { label: 'Saved', value: 'saved', icon: 'Bookmark02Icon' },
              { label: 'Hosting', value: 'hosting', icon: 'WavingHand02Icon' },
            ]}
            selectedCategory={category ?? 'all'}
          />
        </div>
      </div>
    </div>
  );
}
