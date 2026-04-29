import { redirect } from 'next/navigation';

export const JoinCommunityRedirect = ({
  params,
  searchParams,
}: {
  params: { communityId: string };
  searchParams: { token?: string };
}) => {
  const token = searchParams.token;
  const url = token
    ? `/communities/${params.communityId}?token=${token}`
    : `/communities/${params.communityId}`;
  redirect(url);
};
