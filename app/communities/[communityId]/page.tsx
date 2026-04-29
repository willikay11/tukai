import { Session } from 'next-auth';

import { DescriptionShowMore } from '@/app/components/descriptionShowMore';
import { GoogleMapComponent } from '@/app/components/googleMap';
import { IconComponent } from '@/app/components/iconComponent';
import { Share } from '@/app/components/share';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { Separator } from '@/components/ui/separator';
import { getAuthSession } from '@/lib/auth';
import { fetchCommunity } from '@/services/community';
import { ApiResponse } from '@/types/apiResponse';
import { Community, CommunityMember } from '@/types/community';
import { Photo } from '@/types/photo';

import CommunityAdministrator from '../components/communityAdministrator';
import CommunityMembers from '../components/communityMembers';
import Join from '../components/join';
import UpcomingExperiences from '../components/upcomingExperiences';
import AuthGuard from './components/authGuard';
import CommunityTabs from './components/communityTabs';

export default async function ViewCommunityPage({
  params,
  searchParams,
}: {
  params: { communityId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  const session: Session | null = await getAuthSession();

  if (!session) {
    return <AuthGuard />;
  }

  const currentUserId = session?.user?.id || '';

  const communityResponse: ApiResponse = await fetchCommunity(params.communityId);

  if (!communityResponse.data) {
    return;
  }

  const community: Community = communityResponse.data;

  return (
    <>
      <main className="grid grid-cols-12 gap-4">
        <div className="col-span-12 mx-4 mt-8 md:col-span-10 md:col-start-2 md:mx-0 xl:col-span-6 xl:col-start-4 xl:mx-0 3xl:col-span-4 3xl:col-start-5">
          <div className="mb-3 inline-flex w-full justify-between">
            <div className="inline-flex">
              <div className="flex flex-col">
                <p className="mb-1 text-2xl font-black text-gray-700">{community.title}</p>
              </div>
            </div>
            <div className="inline-flex items-center">
              <div className="inline-flex items-center">
                {/* <Bookmark02Icon size={16} variant="twotone" className="text-primary" /> */}
                {/* <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" /> */}
                <Join
                  communityId={community.id}
                  members={community.members}
                  currentUserId={currentUserId}
                  token={token}
                />
                <Share
                  coverPhoto={community.photos[0].photo}
                  title={community.title}
                  link={`${process.env.NEXT_PUBLIC_APP_URL}/communities/${community.id}`}
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <PhotoGallery photos={community.photos} />
          </div>
          <div className="flex flex-col">
            <p className="mb-1 text-base font-black text-gray-600">About</p>
            <div className="mb-3.5 text-sm font-normal text-gray-600">
              <DescriptionShowMore
                text={community.description}
                photo={
                  community.photos.find((photo: Photo) => photo.isCover)?.photo ||
                  community.photos[0].photo
                }
              />
            </div>
            <div className="mb-3.5 inline-flex gap-2">
              {community.categories.map((category) => (
                <div
                  className="inline-flex w-fit flex-shrink-0 rounded-full bg-gray-100 px-4 py-2"
                  key={category.id}
                >
                  <div className="inline-flex items-center">
                    <IconComponent iconName={category.icon} size={18} />
                    <p className="ml-2 whitespace-nowrap text-sm text-gray-700">{category.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-3.5">
              <CommunityMembers members={community.members} size="30px" />
            </div>
            <div className="flex flex-col">
              <p className="mb-2 text-sm font-bold text-gray-700">Community Type</p>
              <p className="text-sm font-normal text-gray-500">
                {community.isPublic ? 'Public' : 'Private (Only invited guests can join)'}
              </p>
            </div>

            <div className="my-4">
              <Separator />
            </div>

            <div className="flex flex-col">
              <p className="mb-3.5 text-sm font-bold text-gray-700">Administrators</p>
              <div className="inline-flex gap-2">
                {community.members
                  .filter(
                    (member: CommunityMember) => member.role === 'admin' || member.role === 'owner',
                  )
                  .map((member) => (
                    <CommunityAdministrator key={member.id} member={member} size="40px" />
                  ))}
              </div>
            </div>

            <div className="my-4">
              <Separator />
            </div>

            <div className="mb-4 rounded-[8px]">
              <GoogleMapComponent
                lat={community.location.point.coordinates[1]}
                lng={community.location.point.coordinates[0]}
              />
            </div>
          </div>
        </div>
      </main>
      <UpcomingExperiences category={community.categories?.[0]?.id} />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 mx-4 mt-2.5 md:col-span-10 md:col-start-2 md:mx-0 xl:col-span-6 xl:col-start-4 xl:mx-0 2xl:col-span-4 2xl:col-start-5">
          <CommunityTabs communityId={params.communityId} />
        </div>
      </div>
    </>
  );
}
