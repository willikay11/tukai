import { fetchExperience } from '@/services/experience';
import { ApiResponse } from '@/types/apiResponse';
import { Experience } from '@/types/experience';
import Reserve from '../../components/reserve';

export default async function ReserveExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  const experienceResponse: ApiResponse = await fetchExperience(params.experienceId);
  if (!experienceResponse.data) {
    return;
  }

  const experience: Experience = experienceResponse.data;

  return (
    <>
      <main className="grid grid-cols-12 gap-4">
        <div className="col-span-12 mt-8 md:col-span-4 md:col-start-5 2xl:col-span-4 2xl:col-start-5">
          <Reserve experience={experience} />
        </div>
      </main>
    </>
  );
}
