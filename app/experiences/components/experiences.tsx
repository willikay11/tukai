import SingleExperience from '@/app/experiences/components/experience';
import { ApiResponse } from '@/types/apiResponse';
import { fetchExperiences } from '@/services/experience';
import { Experience } from '@/types/experience';
import Link from 'next/link';

export default async function Experiences() {
  const experiences: ApiResponse = await fetchExperiences();

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {experiences.data.results.map((experience: Experience) => (
        <div key={experience.id} className="cursor-pointer">
          <Link target="_blank" href={`/experiences/${experience.id}`}>
            <SingleExperience experience={experience} />
          </Link>
        </div>
      ))}
    </div>
  );
}
