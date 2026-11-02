import { OG_CONTENT_TYPE, OG_SIZE } from '@/utils/og-card';

// The full community page's card. The config is restated rather than re-exported:
// Next reads it from this file
export const alt = 'Tukai';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Next's opengraph-image convention requires a default export, as page.tsx does
// eslint-disable-next-line import/no-default-export
export { default } from '@/app/(communities)/communities/[communityId]/opengraph-image';
