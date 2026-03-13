import ExperienceReview from '@/app/experiences/create/components/experienceReview';
import { fetchExperience } from '@/services/experience';
import { ApiResponse } from '@/types/apiResponse';
import { Experience } from '@/types/experience';

export default async function ExperienceReviewPage({
	params,
}: {
	params: { experienceId: string };
}) {
	const experienceResponse: ApiResponse = await fetchExperience(params.experienceId);

	if (!experienceResponse?.data) {
		return (
			<main className="mx-auto mt-8 max-w-6xl px-4">
				<p className="text-sm text-gray-500">Experience not found.</p>
			</main>
		);
	}

	const experience = experienceResponse.data as Experience;

	return (
		<main className="mx-auto mt-6 h-[calc(100vh-120px)] max-w-7xl px-4 pb-6">
			<ExperienceReview experience={experience} invitedMembers={[]} invitedCommunities={[]} />
		</main>
	);
}
