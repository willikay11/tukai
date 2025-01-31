import ScrollFilters from '@/app/ui/scrollFilters';

export default async function ExperienceFilters() {
  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <ScrollFilters
            filters={[
              { label: 'All Experiences', value: '1', icon: 'WorkoutStretchingIcon' },
              { label: 'Reserved Experiences', value: '2', icon: 'CalendarAdd01Icon' },
              { label: 'Saved', value: '3', icon: 'Bookmark02Icon' },
              { label: 'Hosting', value: '4', icon: 'WavingHand02Icon' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
