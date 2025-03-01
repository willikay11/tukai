'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import sanitizeHtml from 'sanitize-html';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ExperiencePhoto } from '@/types/photo';

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
      <div dangerouslySetInnerHTML={{ __html: displayedText }} />
      {shouldTruncate && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn('ml-0 pl-0 font-bold')}
          variant="link"
        >
          {isOpen ? 'Show Less' : 'Show More'}
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 items-end bg-black/50">
          {/* Clickable backdrop */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          <div className="grid h-screen grid-cols-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '5rem', opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="relative h-full w-full rounded-2xl bg-white shadow-xl"
                // style={{ maxHeight: 'calc(100vh - 5rem)', overflow: 'hidden' }}
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

                <div
                  className="overflow-y-auto p-6"
                  style={{ maxHeight: 'calc(100vh - 5rem - 16.25rem)' }}
                >
                  <div dangerouslySetInnerHTML={{ __html: safeText }} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionShowMore;
