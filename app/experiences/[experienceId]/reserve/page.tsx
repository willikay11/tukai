import { fetchExperience } from '@/services/experience';
import { ApiResponse } from '@/types/apiResponse';
import { Experience } from '@/types/experience';

import Reserve from '../../components/reserve';

export const ReserveExperiencePage = async ({
  params,
}: {
  params: { experienceId: string };
}) => {
  const experienceResponse: ApiResponse = await fetchExperience(params.experienceId);
  if (!experienceResponse.data) {
    return;
  }

  const experience: Experience = experienceResponse.data;

  return (
    <>
      <main className="grid grid-cols-12 gap-4">
        <div className="col-span-12 mx-4 mt-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-6 lg:col-start-4 lg:mx-0 2xl:col-span-4 2xl:col-start-5 2xl:mx-0">
          <Reserve experience={experience} />
        </div>
      </main>
    </>
  );
};
