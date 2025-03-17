'use client';
import Image from 'next/image';
import { Bookmark02Icon, CheckmarkBadge02Icon, Share08Icon } from '@hugeicons/react-pro';
import { ApiResponse } from '@/types/apiResponse';
import DescriptionShowMore from '@/app/components/descriptionShowMore';
import { fetchExperience } from '@/services/experience';
import { Experience } from '@/types/experience';
import moment from 'moment';
import { Photo } from '@/types/photo';
import { Button } from '@/components/ui/button';
import numeral from 'numeral';
import IconComponent from '@/app/components/iconComponent';
import GoogleMapComponent from '@/app/components/googleMap';
import { Separator } from '@/components/ui/separator';
import PhotoGallery from '@/components/ui/PhotoGallery';
export default async function ViewExperiencePage({ params }: { params: { experienceId: string } }) {
  const experienceResponse: ApiResponse = await fetchExperience(params.experienceId);

  if (!experienceResponse.data) {
    return;
  }

  const experience: Experience = experienceResponse.data;

  return (
    <main className="grid grid-cols-12 gap-4">
      <div className="col-span-12 mt-8 md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
        <div className="mb-3 inline-flex w-full justify-between">
          <div className="inline-flex">
            <div className="flex flex-col">
              <p className="mb-1 text-2xl font-black text-gray-700">{experience.title}</p>
              <p className="text-base text-gray-700">
                {moment(experience.startDate).format('MMM D, YYYY')} -{' '}
                {moment(experience.endDate).format('MMM D, YYYY')}
              </p>
            </div>
          </div>
          <div className="inline-flex items-start">
            <div className="inline-flex items-center">
              <Bookmark02Icon size={16} variant="twotone" className="text-primary" />
              <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
              <Share08Icon size={16} variant="twotone" className="text-primary" />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <PhotoGallery photos={experience.photos} />
        </div>
        <div className="mb-4 grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <div className="inline-flex w-full rounded-[15px] bg-blue-50 px-2 py-3.5">
              <div className="inline-flex w-full justify-between">
                <div className="inline-flex">
                  <Image
                    src={experience.host.picture}
                    width={40}
                    height={40}
                    alt={experience.host.displayName}
                    className="mr-2.5 h-fit rounded-full"
                  />
                  <div className="flex flex-col">
                    <div className="inline-flex items-center">
                      <p className="mr-1 text-sm font-semibold text-gray-700">
                        {experience.host.displayName}
                      </p>
                      <CheckmarkBadge02Icon size={16} variant="solid" className="text-primary" />
                    </div>
                    <p className="text-sm font-normal text-gray-600">44 Experiences organised</p>
                  </div>
                </div>
                <Button variant="primary-light" className="h-full">
                  Send Message
                </Button>
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <Button size="lg" className="h-full w-full">
              {experience.priceStartsFrom.currency}{' '}
              {numeral(experience.priceStartsFrom.amount).format('0,0')} | Make Reservation
            </Button>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="mb-1 text-base font-black text-gray-600">About</p>
          <div className="text-sm font-normal text-gray-600">
            <DescriptionShowMore
              text={experience.description}
              photo={
                experience.photos.find((photo: Photo) => photo.isCover)?.photo ||
                experience.photos[0].photo
              }
            />
          </div>
          <div className="inline-flex gap-2">
            {experience.categories.map((category) => (
              <div
                className="inline-flex w-fit rounded-full bg-gray-100 px-4 py-2"
                key={category.id}
              >
                {/* {category.icon ? (
                  <div className="mr-2 flex">
                    <IconComponent iconName={category.icon} size={18} />
                  </div>
                ) : null} */}
                <div className="flex flex-col">
                  <p className="text-sm text-gray-700">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex flex-row">
              <div className="mr-2 flex">
                <IconComponent iconName="Clock01Icon" size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-700">Date & Duration</p>
                <p className="mt-1 text-sm font-normal text-gray-500">
                  {moment(experience.startDate).format('MMM D, YYYY')} -{' '}
                  {moment(experience.endDate).format('MMM D, YYYY')}
                </p>
                <Button variant="primary-text" size="sm" className="mt-1 justify-start">
                  View Other Dates
                </Button>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="mr-2 flex">
                <IconComponent iconName="Money03Icon" size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-700">Charges</p>
                <ul className="mt-1 list-disc pl-4">
                  {experience.tickets.map((ticket) => (
                    <li className="text-sm font-normal text-gray-500">
                      <span className="text-gray-700">{ticket.name}</span>&nbsp;-&nbsp;
                      <span className="text-gray-500">
                        {experience.currency} {numeral(ticket.price).format('0,0')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="mr-2 flex">
                <IconComponent iconName="MapPinpoint02Icon" size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-700">Location</p>
                <Button variant="primary-text" size="sm" className="justify-start">
                  {experience.location.formattedAddress}
                </Button>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="mr-2 flex">
                <IconComponent iconName="WorkoutStretchingIcon" size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-700">Experience Type</p>
                <p className="text-sm font-normal text-gray-500">
                  {experience.isPublic ? 'Public' : 'Private (Only invited guests can join)'}
                </p>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="mr-2 flex">
                <IconComponent iconName="CallIcon" size={18} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm font-normal text-gray-500">{/* {experience.host} */}</p>
              </div>
            </div>
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
            <p className="text-sm font-normal text-gray-500">
              Free cancellation before 2 PM on Feb 22.
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
  );
}
