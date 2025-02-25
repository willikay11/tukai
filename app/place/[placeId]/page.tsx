import Image from 'next/image';
import { Bookmark02Icon, Share08Icon } from '@hugeicons/react-pro';
import { ApiResponse } from '@/types/apiResponse';
import { fetchPlace, fetchPlaceProperties, fetchPlaceSocialLinks } from '@/services/place';
import { Place, PlaceProperty, PlaceSocialLink } from '@/types/place';
import DescriptionShowMore from '@/app/components/descriptionShowMore';
import { ExperiencePhoto } from '@/types/experiencePhoto';
import Rating from '@/app/components/rating';
import { Button } from '@/components/ui/button';
import IconComponent from '@/app/components/iconComponent';
import { Separator } from '@/components/ui/separator';
import SocialLinks from '@/app/components/socialLinks';
import GoogleMapComponent from '@/app/components/googleMap';
export default async function ViewPlacePage({ params }: { params: { placeId: string } }) {
  const placeResponse: ApiResponse = await fetchPlace(params.placeId);
  const placePropertyResponse: ApiResponse = await fetchPlaceProperties(params.placeId);
  const placeSocialLinksResponse: ApiResponse = await fetchPlaceSocialLinks(params.placeId);

  if (!placeResponse.data) {
    return;
  }

  const place: Place = placeResponse.data;
  const placeProperties: PlaceProperty[] = placePropertyResponse.data?.results;
  const placeSocialLinks: PlaceSocialLink[] = placeSocialLinksResponse.data?.results;

  return (
    <main className="grid grid-cols-12 gap-4">
      <div className="col-span-12 mt-8 md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
        <div className="mb-3 inline-flex w-full justify-between">
          <div className="inline-flex">
            <div className="flex flex-col">
              <p className="mb-1 text-2xl font-black text-gray-700">{place.title}</p>
              <div className="inline-flex items-center">
                <span className="text-xs">{place.location.formattedAddress}</span>
                <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
                <Rating rating={place.averageRating} />
              </div>
            </div>
          </div>
          <div className="inline-flex items-start">
            <div className="inline-flex h-full items-center justify-center">
              <Bookmark02Icon size={16} variant="twotone" className="text-primary" />
              <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
              <Share08Icon size={16} variant="twotone" className="text-primary" />
              <div className="mr-2" />
              <Button>Add Review</Button>
            </div>
          </div>
        </div>
        <div className="mb-4 flex flex-col">
          <div className="relative mb-2 aspect-square h-[16.25rem] w-full">
            <Image
              src={
                place.photos.find((photo: ExperiencePhoto) => photo.isCover)?.photo ||
                place.photos[0].photo
              }
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
                src={place.photos[1].photo}
                alt=""
                quality={100}
                layout="fill"
                objectFit="cover"
                className="rounded-bl-[15px]"
              />
            </div>

            <div className="relative aspect-square h-[6.25rem] w-full">
              <Image
                src={place.photos[2].photo}
                alt=""
                quality={100}
                layout="fill"
                objectFit="cover"
              />
            </div>

            <div className="relative aspect-square h-[6.25rem] w-full">
              <Image
                src={place.photos[3].photo}
                alt=""
                quality={100}
                layout="fill"
                objectFit="cover"
                className="rounded-br-[15px]"
              />
              <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
                <span className="text-sm font-black text-white">
                  +{place.photos.length - 4} Photos
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 flex flex-col">
          <p className="mb-1 text-base font-black text-gray-600">About</p>
          <div className="text-sm font-normal text-gray-600">
            <DescriptionShowMore text={place.description} maxLength={600} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {placeProperties.map((placeProperty) => (
            <div className="inline-flex" key={placeProperty.id}>
              {placeProperty.icon ? (
                <div className="mr-4 flex">
                  <IconComponent iconName={placeProperty.icon} size={18} />
                </div>
              ) : null}
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-700">{placeProperty.key}</p>
                <p className="text-sm font-normal text-gray-500">{placeProperty.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="my-2.5">
          <Separator />
        </div>
        <div className="mb-4">
          <SocialLinks links={placeSocialLinks} />
        </div>

        {/*<div className="mb-4">*/}
        {/*  <GoogleMapComponent />*/}
        {/*</div>*/}
      </div>
    </main>
  );
}
