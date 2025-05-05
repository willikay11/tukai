import { User } from './user';

export type Comment = {
  id: string;
  post: string;
  commenter: User;
  content: string;
  totalLikes: number;
  dateCreated: string;
  isLiked: boolean;
};
