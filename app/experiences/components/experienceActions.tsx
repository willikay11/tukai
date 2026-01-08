import Link from 'next/link';

import numeral from 'numeral';

import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';

export default function ExperienceActions({ experience }: { experience: Experience }) {
  return (
    <Link href={`/experiences/${experience.id}/reserve`}>
      <Button size="lg" className="xs:h-[50px] w-full sm:h-[50px] md:h-full lg:h-full">
        {experience.priceStartsFrom.currency}{' '}
        {numeral(experience.priceStartsFrom.amount).format('0,0')} | Make Reservation
      </Button>
    </Link>
  );
}
