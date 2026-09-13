import { ExperiencesPageContent } from './ExperiencesPageContent';

export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  return <ExperiencesPageContent initialCategory={searchParams?.category ?? 'all'} />;
}
