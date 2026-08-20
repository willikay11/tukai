import { redirect } from 'next/navigation';

import { SeeAllCitiesContent } from './SeeAllCitiesContent';
import { SeeAllPageContent } from './SeeAllPageContent';
import { isSeeAllType } from './config';

export default function SeeAllExperiencesPage({
  searchParams,
}: {
  searchParams: { type?: string; city?: string };
}) {
  const type = searchParams?.type;

  // An unknown or missing type has no section to render — send them back to
  // the listing rather than showing an empty shell
  if (!isSeeAllType(type)) {
    redirect('/experiences');
  }

  // Cities list destinations rather than experiences; each card drills back
  // into this same page as ?type=city
  if (type === 'cities') {
    return <SeeAllCitiesContent />;
  }

  return <SeeAllPageContent type={type} city={searchParams?.city} />;
}
