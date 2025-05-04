import { Photo } from './photo';
import { User } from './user';

export type Review = {
  id: string;
  title: string;
  description: string;
  dateCreated: string;
  reviewer: User;
  isLiked: boolean;
  totalLikes: number;
  totalComments: number;
  rating: number;
  photos: Photo[];
};
