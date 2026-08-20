'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { PageContainer } from '@/app/shared/components/Layout';
import { useInfiniteMoments } from '@/app/shared/hooks/useMoments';
import { Drawer } from '@/components/ui/drawer';
import { NoData } from '@/components/ui/noData';
import { Moment, momentPhotos } from '@/types/moment';

import { MomentDetail } from './components/MomentDetail';
import { MomentsMasonry } from './components/MomentsMasonry';

const MasonrySkeleton = () => (
  <div className="columns-2 gap-4 md:columns-3">
    {[220, 300, 180, 260, 200, 320].map((height, index) => (
      <div
        key={index}
        style={{ height }}
        className="mb-4 w-full animate-pulse break-inside-avoid rounded-2xl bg-gray-200"
      />
    ))}
  </div>
);

// The detail pane is only rendered from lg up; below that a tap opens a sheet
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isDesktop;
};

export const MomentsView = () => {
  const searchParams = useSearchParams();
  const deepLinkedId = searchParams.get('momentId');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMoments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // The masonry is photo-led. A moment with no media — or whose only media is a
  // video / still-processing upload with photo: null — has nothing to show, and
  // would crash next/image if it reached one.
  const moments: Moment[] = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap((page) => (page?.data?.results ?? []) as Moment[])
        .filter((item) => momentPhotos(item).length > 0),
    [data],
  );

  // Preselect the deep-linked moment when it arrives, otherwise the first one
  useEffect(() => {
    if (selectedId || moments.length === 0) return;

    const deepLinked = deepLinkedId && moments.find((item) => item.id === deepLinkedId);
    setSelectedId(deepLinked ? deepLinked.id : moments[0].id);
  }, [moments, deepLinkedId, selectedId]);

  const selectedMoment = moments.find((item) => item.id === selectedId) ?? null;

  const onSelect = (id: string) => {
    setSelectedId(id);
    // On desktop the sticky pane already shows it; below lg there is no pane,
    // so the moment opens in a sheet instead
    if (!isDesktop) setIsSheetOpen(true);
  };

  return (
    <PageContainer className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Moments</h1>
        <p className="mt-1 text-sm text-gray-400">
          Real photos and stories from the Tukai community
        </p>
      </div>

      {isLoading ? (
        <MasonrySkeleton />
      ) : moments.length === 0 ? (
        <div className="py-16">
          <NoData message="No moments to show yet" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <MomentsMasonry
              moments={moments}
              selectedId={selectedId}
              onSelect={onSelect}
              onLoadMore={fetchNextPage}
              hasMore={Boolean(hasNextPage)}
              isLoadingMore={isFetchingNextPage}
            />
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
              {selectedMoment ? (
                <MomentDetail key={selectedMoment.id} moment={selectedMoment} />
              ) : (
                <p className="text-sm text-gray-400">Pick a moment to see the story behind it.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Drawer
        isOpen={isSheetOpen && !isDesktop && Boolean(selectedMoment)}
        setIsOpen={setIsSheetOpen}
      >
        <div className="px-4 pb-8 pt-4">
          {selectedMoment && <MomentDetail key={selectedMoment.id} moment={selectedMoment} />}
        </div>
      </Drawer>
    </PageContainer>
  );
};
