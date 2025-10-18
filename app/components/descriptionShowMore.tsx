'use client';

import { useEffect, useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import IconComponent from './iconComponent';
import Drawer from '@/components/ui/drawer';
import TukaiImage from '@/components/ui/image';

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

      <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="relative aspect-square h-[16.25rem] w-full">
          {/* <Image
            src={photo}
            alt=""
            quality={100}
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl"
          /> */}
          <TukaiImage src={photo} alt='' quality={100} fill className='rounded-t-2xl' style={{ objectFit: 'cover' }} />
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
      </Drawer>
    </div>
  );
};

export default DescriptionShowMore;
