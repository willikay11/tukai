import { Button } from '@/components/ui/button';
import numeral from 'numeral';
import { Experience } from '@/types/experience';
import Link from 'next/link';

export default function ExperienceActions({ experience }: { experience: Experience }) {
  return (
    <Link href={`/experiences/${experience.id}/reserve`}>
      <Button size="lg" className="h-full w-full">
        {experience.priceStartsFrom.currency}{' '}
        {numeral(experience.priceStartsFrom.amount).format('0,0')} | Make Reservation
      </Button>
    </Link>
  );
}
