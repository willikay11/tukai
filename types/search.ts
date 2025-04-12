import { Experience } from './experience';
import { Place } from './place';

export type SearchResult = {
  id: string;
  type: string;
  data: Place | Experience;
};
