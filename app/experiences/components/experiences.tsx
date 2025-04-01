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
import { EventSkeleton, EventsSkeleton } from '@/app/components/skeletons';
import { motion } from 'framer-motion';

export default function Experiences() {
  const [page, setPage] = useState(1);
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [endPage, setEndPage] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const { data: experiences, isLoading } = useExperiences({
    page,
    enabled: true,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastExperienceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetching || !experiences?.data?.results || (endPage !== null && page > endPage))
        return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && endPage !== null && page < endPage) {
            setIsFetching(true);
            setTimeout(() => {
                setPage((prevPage) => prevPage + 1);
              }, 500);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetching, experiences, page, endPage],
  );

  useEffect(() => {
    if (experiences?.data?.results) {
      setExperienceList((prevExperienceList) => [...prevExperienceList, ...experiences.data.results]);
      if (experiences.data.end_index) {
        setEndPage(experiences.data.end_index);
      }
    }
    setIsFetching(false);
  }, [experiences]);
  
  if (!isLoading && experienceList.length === 0) {
    return <NoData message="No experiences found" />;
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
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading && experienceList.length === 0 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className={isLoading && experienceList.length === 0 ? 'block' : 'hidden'}
      >
        <EventsSkeleton />
      </motion.div>
            
       
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7"
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
              {session?.user && session?.user?.sessionType === 'sign-in' ? (
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

        {isFetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="contents"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <EventSkeleton key={index} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
