import Image from 'next/image';
import { Bookmark02Icon, CheckmarkBadge02Icon, Share08Icon } from '@hugeicons/react-pro';
import { ApiResponse } from '@/types/apiResponse';
import { fetchPlace } from '@/services/place';
import { Place } from '@/types/place';
import DescriptionShowMore from '@/app/components/descriptionShowMore';
export default async function ViewExperiencePage({ params }: { params: { experienceId: string } }) {
  const placeResponse: ApiResponse = await fetchPlace(params.experienceId);

  if (!placeResponse.data) {
    return;
  }

  const place: Place = placeResponse.data;

  return (
    <main className="grid grid-cols-12 gap-4">
      <div className="col-span-12 mt-8 md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
        <div className="mb-3 inline-flex w-full justify-between">
          <div className="inline-flex">
            <div className="flex flex-col">
              <p className="mb-1 text-2xl font-black text-gray-700">{place.title}</p>
              <p className="text-base text-gray-700">Feb 23, 10:00 AM - 5:00 PM</p>
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
        <div className="mb-4 flex flex-col">
          <div className="relative mb-2 aspect-square h-[16.25rem] w-full">
            <Image
              src="/images/santorini.webp"
              alt=""
              quality={100}
              layout="fill"
              objectFit="cover"
              className="rounded-tl-[15px] rounded-tr-[15px]"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative aspect-square h-[6.25rem] w-full">
              <Image
                src="/images/lake.jpeg"
                alt=""
                quality={100}
                layout="fill"
                objectFit="cover"
                className="rounded-bl-[15px]"
              />
            </div>

            <div className="relative aspect-square h-[6.25rem] w-full">
              <Image
                src="/images/infinite-pool.webp"
                alt=""
                quality={100}
                layout="fill"
                objectFit="cover"
              />
            </div>

            <div className="relative aspect-square h-[6.25rem] w-full">
              <Image
                src="/images/man-bridge-running.webp"
                alt=""
                quality={100}
                layout="fill"
                objectFit="cover"
                className="rounded-br-[15px]"
              />
              <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
                <span className="text-sm font-black text-white">+46 Photos</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <div className="inline-flex w-full rounded-[15px] bg-blue-50 px-2 py-3.5">
              <div className="inline-flex w-full justify-between">
                <div className="inline-flex">
                  <Image
                    src="/images/profile.svg"
                    width={40}
                    height={40}
                    alt="Picture of the author"
                    className="mr-2.5 rounded-full"
                  />
                  <div className="flex flex-col">
                    <div className="inline-flex items-center">
                      <p className="mr-1 text-sm font-semibold text-gray-700">Thyyard_gym</p>
                      <CheckmarkBadge02Icon size={16} variant="solid" className="text-primary" />
                    </div>
                    <p className="text-sm font-normal text-gray-600">44 Experiences organised</p>
                  </div>
                </div>
                <div className="flex h-full cursor-pointer items-center rounded-[10px] bg-emerald-100 px-4">
                  <p className="text-sm font-medium text-primary">Send Message</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <div className="flex h-full cursor-pointer items-center justify-center rounded-[10px] bg-primary px-4">
              <p className="text-sm font-medium text-white">Ksh. 20,000.00 | Make Reservation</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="mb-1 text-base font-black text-gray-600">About</p>
          <div className="text-sm font-normal text-gray-600">
            <DescriptionShowMore text={place.description} />
          </div>
        </div>
      </div>
    </main>
  );
}
