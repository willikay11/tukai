import { redirect } from 'next/navigation';

import { SeeAllPageContent } from './SeeAllPageContent';
import { isSeeAllType } from './config';

export default function SeeAllExperiencesPage({
  searchParams,
}: {
  searchParams: { type?: string; city?: string };
}) {
  // An unknown or missing type has no section to render — send them back to
  // the listing rather than showing an empty shell
  if (!isSeeAllType(searchParams?.type)) {
    redirect('/experiences');
  }

  return <SeeAllPageContent type={searchParams.type} city={searchParams?.city} />;
}
