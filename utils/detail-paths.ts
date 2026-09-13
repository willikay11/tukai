/**
 * Where a place, an experience or a community lives on the site.
 *
 * The detail routes carry the API's `slug` rather than its UUID, which reads
 * better and is what gets shared. The API accepts either on the detail route
 * and on every nested one, so a link made before slugs — or a bookmark — still
 * resolves, and the id is the fallback whenever a record has no slug yet.
 */
export const placePath = (place: { id: string; slug?: string }): string =>
  `/places/${place.slug || place.id}`;

export const experiencePath = (experience: { id: string; slug?: string }): string =>
  `/experiences/${experience.slug || experience.id}`;

export const communityPath = (community: { id: string; slug?: string }): string =>
  `/communities/${community.slug || community.id}`;
