export type Photo = {
  id: string;
  mediaType: 'image' | 'video';
  experience?: string;
  photo?: string;
  caption?: string;
  isCover?: boolean;
};

export type PhotoItem = { type: 'existing'; id: string; url: string } | { type: 'new'; file: File };
