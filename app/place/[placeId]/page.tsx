import Image from 'next/image';
import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';
import { ApiResponse } from '@/types/apiResponse';
import { fetchPlace, fetchPlaceProperties, fetchPlaceSocialLinks } from '@/services/place';
import { Place, PlaceProperty, PlaceSocialLink } from '@/types/place';
import DescriptionShowMore from '@/app/components/descriptionShowMore';
import { Photo } from '@/types/photo';
import Rating from '@/app/components/rating';
import IconComponent from '@/app/components/iconComponent';
import { Separator } from '@/components/ui/separator';
import SocialLinks from '@/app/components/socialLinks';
import GoogleMapComponent from '@/app/components/googleMap';
import PlaceTabs from '@/app/place/components/placeTabs';
import PlaceActions from '../components/placeActions';
import PhotoGallery from '@/components/ui/PhotoGallery';

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

  console.log('place', place.categories);
  
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
            <PlaceActions
              placeId={params.placeId}
              bookmarked={place.isBookmarked}
              placeTitle={place.title}
              coverPhoto={
                place.photos?.find((photo: Photo) => photo.isCover)?.photo || place.photos[0].photo
              }
            />
          </div>
        </div>
        <div className="mb-4">
          <PhotoGallery photos={place.photos} />
        </div>
        <div className="mb-4 flex flex-col">
          <p className="mb-1 text-base font-black text-gray-600">About</p>
          <div className="text-sm font-normal text-gray-600">
            <DescriptionShowMore
              photo={
                place.photos.find((photo: Photo) => photo.isCover)?.photo || place.photos[0].photo
              }
              text={place.description}
              maxLength={600}
            />
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
                <p className="text-sm font-medium text-gray-500">{placeProperty.value}</p>
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

        <div className="mb-4 rounded-[8px]">
          <GoogleMapComponent
            lat={place.location.point.coordinates[1]}
            lng={place.location.point.coordinates[0]}
          />
        </div>
      </div>
      <div className="col-span-12 bg-gray-100 py-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-start-4 2xl:col-start-5">
            <p className="mb-2.5 text-base font-semibold text-gray-800">
              Local Guides - <span className="font-normal">coming soon</span>
            </p>
            <div className="inline-flex">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="mr-4 w-fit rounded-[8px] bg-white px-4 py-2">
                  <div className="flex flex-row">
                    <div className="relative mr-2 flex aspect-square h-20 w-20 flex-col">
                      <Image
                        src="/images/two.jpg"
                        alt=""
                        quality={100}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-[8px]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="mb-1.5 inline-flex text-sm font-black text-gray-800">
                        <span className="mr-2">Cameron Williamson</span>
                        <CheckmarkBadge02Icon
                          size={16}
                          variant="solid"
                          className="text-green-600"
                        />
                      </p>
                      <div className="mb-1.5 inline-flex items-center">
                        <Rating rating={4.5} />
                        <span className="text-sm font-medium">4.5</span>
                        <div className="mx-2 h-[4px] w-[4px] rounded-full bg-gray-100" />
                        <span className="text-sm font-medium">54 Reviews</span>
                      </div>
                      <p className="text-sm font-medium">Ksh. 20,000.00/person</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
        <PlaceTabs placeId={params.placeId} categories={place.categories} />
      </div>
    </main>
  );
}
