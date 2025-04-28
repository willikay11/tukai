'use client';
import SingleExperience from '@/app/experiences/components/experience';
import { Experience } from '@/types/experience';
import Link from 'next/link';
import { useExperiences } from '@/hooks/experiences';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import SignInForm from '@/components/ui/form/sign-in';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import NoData from '@/components/ui/noData';
import { motion } from 'framer-motion';
import { Status } from '@/enums/status';
type ListExperiencesProps = {
  category?: string;
};
const placeholders: Experience[] = Array.from({ length: 12 }, (_, index) => ({
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

export default function Experiences({ category }: ListExperiencesProps) {
  const [page, setPage] = useState(1);
  const [experienceList, setExperienceList] = useState<Experience[]>(placeholders);
  const [endPage, setEndPage] = useState<number | null>(null);
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const { data: experiences, isLoading } = useExperiences({
    page,
    enabled: true,
    category,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastExperienceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || !experiences?.data?.results) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && endPage !== null && page < endPage) {
          setTimeout(() => {
            setPage((prevPage) => prevPage + 1);
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
      setExperienceList((prevExperienceList) => [...prevExperienceList, ...placeholders]);
      ``;
    } else if (!isLoading && experiences?.data?.results) {
      setExperienceList((prevExperienceList) => [
        ...prevExperienceList.filter((experience) => !experience.id.startsWith('placeholder-')),
        ...experiences.data.results,
      ]);
      if (experiences.data.count) {
        setEndPage(Math.ceil(experiences.data.count / 12));
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
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
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
              {session?.user ? (
                <Link target="_blank" href={`/experiences/${experience.id}`}>
                  <SingleExperience experience={experience} />
                </Link>
              ) : (
                <div onClick={() => setOpen(true)}>
                  <SingleExperience experience={experience} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
