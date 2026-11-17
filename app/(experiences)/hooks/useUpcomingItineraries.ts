import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';

/**
 * Read in one go: the rail shows ten, the See all tile three more, and the
 * expanded grid every one, so the section pages through this locally.
 */
const ITINERARY_FETCH_SIZE = 50;

/**
 * Itineraries still to come, soonest first. One that has started but not yet
 * finished is still on, so it is the end that has to be past.
 */
export const upcomingItineraries = (itineraries: Experience[], now = new Date()): Experience[] =>
  itineraries
    .filter((itinerary) => {
      const end = new Date(itinerary.endDate || itinerary.startDate).getTime();
      return Number.isNaN(end) || end >= now.getTime();
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

/**
 * The "Discover itineraries" pool: published itineraries still to come,
 * soonest first.
 *
 * ⚠️ The design scopes the pool to the current city. The list endpoint is
 * geo-ORDERED by lat/long, never geo-filtered, so this reads the nearest
 * fifty and sorts those by date. It cannot promise every one is in the city.
 */
export const useUpcomingItineraries = (enabled: boolean) => {
  const { lat, lng } = useLocation();

  const { data, isLoading } = useExperiences(
    {
      page: 1,
      page_size: ITINERARY_FETCH_SIZE,
      status: 'published',
      experience_type: 'itinerary',
      lat,
      long: lng,
    },
    enabled,
  );

  const itineraries: Experience[] = upcomingItineraries(data?.data?.results ?? []);

  return { itineraries, isLoading };
};
