const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CreateStepContentSkeleton() {
  return (
    <div className={`${shimmer} relative mt-6 space-y-4`}>
      <div className="h-6 w-48 rounded-md bg-gray-200" />
      <div className="h-4 w-full rounded-md bg-gray-200" />
      <div className="h-4 w-10/12 rounded-md bg-gray-200" />
      <div className="h-12 w-full rounded-xl bg-gray-200" />
      <div className="h-12 w-full rounded-xl bg-gray-200" />
      <div className="h-12 w-2/3 rounded-xl bg-gray-200" />
    </div>
  );
}

export function WalletListSkeleton() {
  return (
    <div className={`${shimmer} relative mt-3 space-y-3`}>
      <div className="h-4 w-28 rounded-md bg-gray-200" />
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 h-4 w-40 rounded-md bg-gray-200" />
        <div className="mb-2 h-3 w-52 rounded-md bg-gray-200" />
        <div className="h-3 w-24 rounded-md bg-gray-200" />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 h-4 w-36 rounded-md bg-gray-200" />
        <div className="mb-2 h-3 w-48 rounded-md bg-gray-200" />
        <div className="h-3 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function ReviewWalletsSkeleton() {
  return (
    <div className={`${shimmer} relative mt-6 rounded-[12px] border border-gray-200 bg-gray-100 p-5`}>
      <div className="mb-3 h-5 w-36 rounded-md bg-gray-200" />
      <div className="mb-4 h-3 w-56 rounded-md bg-gray-200" />
      <div className="space-y-3">
        <div className="rounded-[12px] border border-gray-200 bg-white p-4">
          <div className="mb-2 h-4 w-24 rounded-md bg-gray-200" />
          <div className="h-3 w-44 rounded-md bg-gray-200" />
        </div>
        <div className="rounded-[12px] border border-gray-200 bg-white p-4">
          <div className="mb-2 h-4 w-36 rounded-md bg-gray-200" />
          <div className="h-3 w-52 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
