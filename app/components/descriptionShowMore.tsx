'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import sanitizeHtml from 'sanitize-html';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import IconComponent from './iconComponent';

const DescriptionShowMore = ({
  photo,
  text,
  maxLength = 100,
}: {
  photo: string;
  text: string;
  maxLength?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sanitize text to prevent XSS (if content is dynamic)
  const safeText = sanitizeHtml(text);

  // Determine whether to truncate text
  const shouldTruncate = text.length > maxLength;
  const displayedText = !shouldTruncate ? safeText : safeText.slice(0, maxLength) + '...';

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  return (
    <div>
      <div className="font-medium" dangerouslySetInnerHTML={{ __html: displayedText }} />
      {shouldTruncate && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn('ml-0 pl-0 font-bold')}
          variant="link"
        >
          {isOpen ? 'Show Less' : 'Show More'}
        </Button>
      )}

      <AnimatePresence initial={false} mode="wait">
        {isOpen && (
          <div className="fixed inset-0 z-50 items-end bg-black/50">
            <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

            <div className="grid h-screen grid-cols-12 overflow-y-auto scroll-smooth">
              <div className="col-span-12 flex flex-col justify-end md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
                <motion.div
                  initial={{ y: '100%', opacity: 0, transition: { duration: 0.5 } }}
                  animate={{ y: '0rem', opacity: 1 }}
                  exit={{ y: '100%', opacity: 0, transition: { duration: 0.5 } }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  className="relative h-fit w-full rounded-t-2xl bg-white shadow-xl"
                >
                  <div className="relative aspect-square h-[16.25rem] w-full">
                    <Image
                      src={photo}
                      alt=""
                      quality={100}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-2xl"
                    />
                  </div>

                  <div className="max p-6">
                    <p className="mb-1 text-base font-black text-gray-600">About</p>
                    <div className="font-medium" dangerouslySetInnerHTML={{ __html: safeText }} />
                  </div>
                  <div className="fixed bottom-[1rem] left-0 right-0 flex justify-center">
                    <Button
                      size="sm"
                      className="h-[50px] w-[94px] rounded-[70px] bg-gray-800/50 px-4 text-white hover:bg-red-800/70"
                      onClick={() => setIsOpen(false)}
                    >
                      <IconComponent iconName="Cancel01Icon" size={16} />
                      Close
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DescriptionShowMore;
