'use client';
import SingleExperience from '@/app/components/experiences/Single';
import { Experience } from '@/types/experience';
import Link from 'next/link';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import SignInForm from '@/components/ui/form/sign-in';
import { useCallback, useEffect, useRef, useState } from 'react';
import NoData from '@/components/ui/noData';
import { motion } from 'framer-motion';
import { Status } from '@/enums/status';

type ListExperiencesProps = {
  className: string;
  isLoading: boolean;
  count: number;
  experiences: Experience[];
  invitedExperiences?: Experience[];
  page: number;
  setPage: (nextPage: number) => void;
  skeletonCount?: number;
};

const placeholders = (skeletonCount: number): Experience[] => {
  return Array.from({ length: skeletonCount }, (_, index) => ({
    id: `placeholder-${index}`,
    title: 'Loading...',
    description: '',
    location: {
      id: '',
      name: '',
      pointLat: 0,
      pointLong: 0,
      point: { type: 'Point', coordinates: [0, 0] },
      formattedAddress: '',
      street: '',
      city: '',
      state: '',
      country: '',
    },
    dateCreated: '',
    startDate: '',
    endDate: '',
    currency: '',
    priceStartsFrom: { amount: 0, currency: '' },
    ticketsAvailable: false,
    isSoldOut: false,
    isPublic: false,
    isBookmarked: false,
    status: 'DRAFT' as Status,
    photos: [],
    totalReviews: 0,
    averageRating: 0,
    categories: [],
    tickets: [],
    host: {
      id: '',
      firstName: '',
      lastName: '',
      displayName: '',
      picture: '',
    },
    coHosts: [],
  }));
};

export default function ListExperiences({
  experiences,
  isLoading,
  count,
  className,
  skeletonCount = 12,
  page,
  setPage,
}: ListExperiencesProps) {
  const [experienceList, setExperienceList] = useState<Experience[]>(placeholders(skeletonCount));
  const [endPage, setEndPage] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastExperienceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || !experiences) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && endPage !== null && page < endPage) {
          setTimeout(() => {
            setPage(page + 1);
          }, 500);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, experiences, page, endPage],
  );

  useEffect(() => {
    if (
      isLoading &&
      !experienceList.some((experience) => experience.id.startsWith('placeholder-'))
    ) {
      setExperienceList((prevExperienceList) => [
        ...prevExperienceList,
        ...placeholders(skeletonCount),
      ]);
    } else if (!isLoading && experiences) {
      setExperienceList((prevExperienceList) => [
        ...prevExperienceList.filter((experience) => !experience.id.startsWith('placeholder-')),
        ...experiences,
      ]);
      if (count) {
        setEndPage(Math.ceil(count / 12));
      }
    } else if (!isLoading) {
      setExperienceList((prevExperienceList) =>
        prevExperienceList.filter((experience) => !experience.id.startsWith('placeholder-')),
      );
    }
  }, [experiences, isLoading]);

  if (!isLoading && experienceList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <NoData message="No experiences found" />
      </motion.div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="px-16">
          <SignInForm
            onLogin={() => {
              setOpen(false);
              toast({
                description: 'Welcome Back!',
                variant: 'success',
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={className}
      >
        {experienceList.map((experience: Experience, index: number) => {
          const isLastElement = index === experienceList.length - 1;
          return (
            <motion.div
              key={experience.id}
              ref={isLastElement ? lastExperienceElementRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              {/* {session?.user ? ( */}
              <Link target="_blank" href={`/experiences/${experience.id}`}>
                <SingleExperience experience={experience} />
              </Link>
              {/* ) : (
                <div onClick={() => setOpen(true)}>
                  <SingleExperience experience={experience} />
                </div>
              )} */}
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
