import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import { fetchExperiences } from './experience';
import { fetchPlaces } from './place';
import { SearchResult } from '@/types/search';
import { isExperience } from '@/types/experience';

export const searchPlaces = async (query: string): Promise<SearchResult[]> => {
  const [places, experiences] = await Promise.all([
    fetchPlaces(1, 12, undefined, query),
    fetchExperiences(1, 12, query),
  ]);

  const placesData = parseSnakeToCamel(places.data?.results);
  const experiencesData = parseSnakeToCamel(experiences.data?.results);

  const searchResults = [...placesData, ...experiencesData].map((results, index) => ({
    id: index.toString(),
    type: isExperience(results) ? 'experience' : 'place',
    data: results,
  }));

  return searchResults;
};
