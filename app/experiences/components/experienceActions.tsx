'use client';

import { Button } from '@/components/ui/button';
import numeral from 'numeral';
import { Experience } from '@/types/experience';
import Reserve from './reserve';
import { useState } from 'react';

export default function ExperienceActions({ experience }: { experience: Experience }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Reserve isOpen={isOpen} closeModal={() => setIsOpen(false)} experience={experience} />
      <Button size="lg" className="h-full w-full" onClick={() => setIsOpen(true)}>
        {experience.priceStartsFrom.currency}{' '}
        {numeral(experience.priceStartsFrom.amount).format('0,0')} | Make Reservation
      </Button>
    </>
  );
}
