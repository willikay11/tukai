import { Experience } from '@/app/lib/definitions';

export async function fetchExperiences() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return [
    {
      id: '1',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/hikers-happy.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
    {
      id: '2',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/man-rainforest.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
    {
      id: '3',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/one.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
    {
      id: '4',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/two.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
    {
      id: '5',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/three.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
    {
      id: '6',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/four.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
    {
      id: '7',
      name: 'Mt Kenya (Point Thompson)',
      image: '/images/four.svg',
      rating: '4.5',
      reviews: 54,
      location: 'Central Kenya',
      distance: '22 KM',
      duration: '2 Hrs 30 mins',
    },
  ];
}
