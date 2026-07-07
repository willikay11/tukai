import { Experiences } from '@/app/(experiences)/experiences/components/List/experiences';

export default function DiscoverPage() {
  return (
    <main className="grid h-full grid-cols-12 gap-x-4 px-4 md:px-0">
      <Experiences title="Discover" isPortal={false} />
    </main>
  );
}
