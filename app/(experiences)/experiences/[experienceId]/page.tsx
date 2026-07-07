import { fetchExperience } from '@/services/experience';
import { ApiResponse } from '@/types/apiResponse';
import { Experience } from '@/types/experience';

import { ViewExperiencePageContent } from './ViewExperiencePageContent';

export default async function ViewExperiencePage({ params }: { params: { experienceId: string } }) {
  const experienceResponse: ApiResponse = await fetchExperience(params.experienceId);
  if (!experienceResponse.data) {
    return;
  }

  const experience: Experience = experienceResponse.data;

  return <ViewExperiencePageContent experience={experience} />;
}
