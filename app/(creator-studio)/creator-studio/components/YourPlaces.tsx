import { IconComponent } from '@/app/shared/components/Icons';

/**
 * ⚠️ The places API has no ownership filter — fetchPlaces takes category,
 * search and coordinates only, and Place carries no owner field. So the places
 * a host owns cannot be listed yet. The section renders its shell and the
 * add tile; both are inert until an owner-scoped endpoint exists.
 */
export const YourPlaces = () => (
  <section>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Places</h2>
        <p className="mt-0.5 text-sm text-gray-400">
          Listings you own that take reservations on Tukai
        </p>
      </div>

      <button
        type="button"
        disabled
        title="Adding a place is not available yet"
        className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        <IconComponent iconName="PlusSignIcon" size={16} color="currentColor" />
        Add a place
      </button>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <IconComponent
            iconName="PlusSignIcon"
            size={20}
            color="currentColor"
            className="text-gray-500"
          />
        </div>
        <p className="mt-3 font-semibold text-gray-700">Add a place</p>
        <p className="mt-1 text-xs text-gray-400">Owner-linked places are not available yet</p>
      </div>
    </div>
  </section>
);
