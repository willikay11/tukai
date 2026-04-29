'use client';

import { useRouter } from 'next/navigation';

import {
  CheckListIcon,
  Edit01Icon,
  MapsLocation02Icon,
  Message02Icon,
  RouteBlockIcon,
  Share08Icon,
  TickDouble01Icon,
  UserCheck01Icon,
  UserGroupIcon,
  ViewOffIcon,
  WorkoutRunIcon,
} from '@hugeicons/react-pro';

import { Anchor, Button } from '@/app/components/form';

const features = [
  {
    icon: <WorkoutRunIcon size={20} className="text-blue-500" />,
    title: 'Discover Activities',
    description:
      'Get access to unlimited activities such as hiking, camping, bike riding, Drives, Sunset watching etc',
  },
  {
    icon: <RouteBlockIcon size={20} className="text-yellow-600" />,
    title: 'Discover & Visit Places',
    description:
      'Access hiking places, parks, mountains and all the fun places you love. You can also plan your trips.',
  },
  {
    icon: <Edit01Icon size={20} className="text-rose-500" />,
    title: 'Create Activities',
    description:
      'Planning a free or payable hiking, biking or even a camping trip? Create it and invite others.',
  },
  {
    icon: <UserGroupIcon size={20} className="text-indigo-500" />,
    title: 'Follow Different Groups, Places & Members',
    description:
      'Whether you like biking or camping or specific people, you can follow them and keep updated when they post.',
  },
  {
    icon: <Share08Icon size={20} className="text-pink-600" />,
    title: 'Share your Activities',
    description:
      'A 20K hike is such a great achievement, why don’t you share that with friends on Whatsapp or Instagram.',
  },
  {
    icon: <Message02Icon size={20} className="text-orange-500" />,
    title: 'Comment and like community posts',
    description: 'Make those posts interactive by commenting or liking posts from the community.',
  },
  {
    icon: <CheckListIcon size={20} className="text-indigo-600" />,
    title: 'Create Your List',
    description:
      'You like an activity but don’t have time yet to join in, create you own list and revisit later.',
  },
  {
    icon: <UserCheck01Icon size={20} className="text-green-500" />,
    title: 'Vetted Activity Planners',
    description:
      'Whether you like biking or camping or specific people, you can follow them and keep updated when they post.',
  },
  {
    icon: <TickDouble01Icon size={20} className="text-yellow-600" />,
    title: 'Track Your Progress',
    description:
      'Check different activities you have participated in the past. When you decide to, for example, hike a place, we’ll track that.',
  },
  {
    icon: <MapsLocation02Icon size={20} className="text-blue-500" />,
    title: 'Maps to Different Places',
    description: 'Get a detailed location details to different places or activities. ',
  },
  {
    icon: <ViewOffIcon size={20} className="text-pink-500" />,
    title: 'No Ads',
    description: 'Yup, no adverts.',
  },
];
export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="mb-4">
        <p className="text-xl font-black text-gray-700">Discover Places, Organise</p>
        <p className="text-xl font-black text-gray-700">Experiences and Join Communities.</p>
      </div>

      <div className="h-72 overflow-scroll">
        <p className="mb-4 w-[80%] text-xs text-gray-700">
          Your first week’s on the house. After that we’ll charge only{' '}
          <span className="font-bold">US$ 1.00</span> a month.
        </p>
        {features.map((feature) => (
          <div key={feature.title} className="mb-4 flex flex-row gap-x-2">
            <div className="flex">{feature.icon}</div>

            <div className="flex-col">
              <p className="text-sm font-bold text-gray-800">{feature.title}</p>
              <p className="text-xs text-gray-700">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="-mx-[1.875rem] mb-4 h-[1px] bg-gray-200 md:-mx-[3.875rem]"
        style={{ boxShadow: ' 0px -1px 4px 0px rgba(0, 0, 0, 0.12)' }}
      />

      <div className="mb-2 inline-flex w-full items-center justify-center">
        <span className="text-xs text-gray-700">
          <span className="font-bold">US$1.OO</span> a month
        </span>
        <div className="mx-2 h-[5px] w-[5px] rounded-full bg-green-500"></div>
        <span className="text-xs text-gray-700">Cancel Anytime</span>
      </div>

      <div className="mb-2.5">
        <Button block onClick={() => router.push('/auth/subscribe')}>
          Start Your Subscription
        </Button>
      </div>

      <div className="flex w-full items-center justify-center">
        <Anchor link="/">Skip</Anchor>
      </div>
    </>
  );
}
