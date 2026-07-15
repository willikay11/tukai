'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { IconComponent } from '@/app/shared/components/Icons';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Experience } from '@/types/experience';

interface ExperienceUnavailableProps {
  experienceName: string | null;
  // Excluded so a sold-out/unpublished experience doesn't suggest itself
  excludeExperienceId?: string | null;
}

export const ExperienceUnavailable = ({
  experienceName,
  excludeExperienceId = null,
}: ExperienceUnavailableProps) => {
  const router = useRouter();

  // No similar/recommended endpoint exists — the default list (same source
  // as "Happening Near You") is the closest available query
  const { data: similarResponse } = useExperiences({ page: 1, page_size: 9 }, true);
  const similarExperiences: Experience[] = (similarResponse?.data?.results ?? [])
    .filter((experience: Experience) => experience.id !== excludeExperienceId)
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        {/* 404 heading — middle 0 is lime */}
        <h1 className="text-8xl font-extrabold leading-none">
          <span className="text-primary">4</span>
          <span className="text-lime">0</span>
          <span className="text-primary">4</span>
        </h1>

        {/* Compass icon in grey circle — same icon as the Discover nav item */}
        <div className="mt-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <IconComponent iconName="CompassIcon" size={22} className="text-primary" />
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          This experience is no longer available
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
          {experienceName && (
            <span className="font-semibold text-gray-700">&ldquo;{experienceName}&rdquo; </span>
          )}
          may have been removed by its host, sold out, or the link has expired.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => router.push('/experiences')} className="rounded-full px-6">
            Explore experiences
          </Button>
          {/* Placeholder like the nav's AskTukaiButton — no assistant exists yet */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-800 hover:border-gray-300"
          >
            <IconComponent iconName="SparklesIcon" size={16} className="text-primary" />
            Ask TukAI
          </button>
        </div>
      </div>

      {/* Similar experiences */}
      {similarExperiences.length > 0 && (
        <section className="mt-20">
          <SectionHeader
            title="You might like these instead"
            subtitle="Similar adventures, available now"
          />
          <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
            <CarouselContent>
              {similarExperiences.map((experience) => (
                <CarouselItem key={experience.id} className="basis-auto">
                  <div className="w-[280px]">
                    <Link href={`/experiences/${experience.id}`}>
                      <SingleExperience type="discover" variant="row" experience={experience} />
                    </Link>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>
      )}
    </main>
  );
};
