import { Community } from './community';
import { Experience } from './experience';
import { Place } from './place';

export type SearchResultType = 'experience' | 'place' | 'community';

export type SearchResult = {
  id: string;
  type: SearchResultType;
  data: Place | Experience | Community;
};
