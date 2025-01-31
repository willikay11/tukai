import { Experience } from '@/app/lib/definitions';
import { hugeiconsLicense } from '@hugeicons/react-pro';
import { ApiResponse, fetchExperiences } from '@/app/lib/data';
import SingleExperience from '@/app/experiences/components/experience';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export default async function Experiences() {
  const experiences: ApiResponse = await fetchExperiences();

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {experiences.data.results.map((experience: Experience) => (
        <div key={experience.id} className="cursor-pointer">
          <SingleExperience experience={experience} />
        </div>
      ))}
    </div>
  );
}
