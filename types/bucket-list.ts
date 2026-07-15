export interface BucketListMember {
  id: string;
  name: string;
  picture: string | null;
}

export interface BucketList {
  id: string;
  title: string;
  isPublic: boolean;
  coverPhoto: string | null;
  savedCount: number;
  previewPhotos: string[]; // small thumbnails on the cover
  members: BucketListMember[];
  owner: { id: string; name: string };
  isOwner: boolean;
  hasJoined: boolean;
}

export interface CreateBucketListPayload {
  title: string;
  isPublic: boolean;
}
