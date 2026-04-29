import moment from 'moment';

import { DescriptionShowMore } from '@/app/components/descriptionShowMore';
import { GoogleMapComponent } from '@/app/components/googleMap';
import { IconComponent } from '@/app/components/iconComponent';
import { Share } from '@/app/components/share';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { fetchExperience } from '@/services/experience';
import { ApiResponse } from '@/types/apiResponse';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import BookmarkExperience from '../components/bookmarkExperience';
import ExperienceActions from '../components/experienceActions';
import ExperienceDetails from '../components/experienceDetails';
import ExperienceOrganiser from '../components/experienceOrganiser';

export default async function ViewExperiencePage({ params }: { params: { experienceId: string } }) {
  const experienceResponse: ApiResponse = await fetchExperience(params.experienceId);
  if (!experienceResponse.data) {
    return;
  }

  const experience: Experience = experienceResponse.data;

  const closingDuration = experience?.ticketSalesClosingDuration;
  const closingUnitRaw = experience?.ticketSalesClosingUnit ?? '';
  const closingUnit =
    closingDuration === 1 && closingUnitRaw.endsWith('s')
      ? closingUnitRaw.slice(0, -1)
      : closingUnitRaw;
  const closingConditionText =
    experience?.ticketSalesClosingCondition === 'before_start'
      ? 'before the experience starts.'
      : 'before the experience ends.';

  return (
    <>
      <main className="grid grid-cols-12 gap-4">
        <div className="col-span-12 mx-4 mt-8 md:col-span-6 md:col-start-4 md:mx-0 lg:col-span-8 lg:col-start-2 lg:mx-0 3xl:col-span-4 3xl:col-start-5">
          <div className="mb-3 inline-flex w-full justify-between">
            <div className="inline-flex">
              <div className="flex flex-col">
                <p className="mb-1 text-2xl font-black text-gray-700">{experience.title}</p>
                <p className="text-base text-gray-700">
                  {moment(experience.startDate)?.format('MMM D, YYYY')} -{' '}
                  {moment(experience.endDate)?.format('MMM D, YYYY')}
                </p>
              </div>
            </div>
            <div className="inline-flex items-start">
              <div className="inline-flex items-center">
                <BookmarkExperience experience={experience} />
                <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
                <Share
                  coverPhoto={
                    experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
                    experience.photos[0].photo
                  }
                  title={experience.title}
                  link={`${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experience.id}`}
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <PhotoGallery photos={experience.photos} />
          </div>
          <div className="mb-4 grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <ExperienceOrganiser experience={experience} />
            </div>
            <div className="col-span-12 md:col-span-5">
              <ExperienceActions experience={experience} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mt-2.5 inline-flex flex-wrap gap-2">
              {experience.categories.map((category) => (
                <div
                  className="inline-flex w-fit rounded-full bg-gray-100 px-4 py-2"
                  key={category.id}
                >
                  <div className="inline-flex items-center gap-2">
                    <IconComponent iconName={category.icon as string} size={16} color="gray-700" />
                    <p className="text-sm text-gray-700">{category.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mb-1 mt-2.5 text-base font-black text-gray-600">About</p>
            <div className="text-sm font-normal text-gray-600">
              <DescriptionShowMore
                text={experience.description}
                photo={
                  experience.photos.find((photo: Photo) => photo.isCover)?.photo ||
                  experience.photos[0].photo
                }
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <ExperienceDetails experience={experience} />
            </div>

            <div className="my-4">
              <Separator />
            </div>

            <div className="mb-4 rounded-[8px]">
              <GoogleMapComponent
                lat={experience.location.point.coordinates[1]}
                lng={experience.location.point.coordinates[0]}
              />
            </div>

            <div className="mb-4">
              <p className="text-base font-bold text-gray-700">Cancellation Policy</p>
              <p className="text-sm font-medium text-gray-500">
                Ticket sales close {closingDuration} {closingUnit} {closingConditionText}
              </p>
            </div>

            <div className="my-4">
              <Separator />
            </div>

            <Button variant="text" className="justify-start">
              <IconComponent iconName="Flag02Icon" color="red" size={18} />
              Report this experience
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
